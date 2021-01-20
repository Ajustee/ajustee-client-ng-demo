import { Component, Directive, QueryList, ViewChildren, ElementRef, Input, ChangeDetectorRef, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl, Validators } from '@angular/forms';
import { KeyChangesComponent } from './key-changes.component';
import { ToastrService } from 'ngx-toastr';
import { KeySubscriptionsComponent } from './key-subscriptions.component';
import { ConfigurationKeyVm, CcKeyLog, OverrideFormControls, SubscrConfigurationKey } from './models';
import { AjusteeClient, AjusteeAllKeysListener, AjusteeKeyListenerCode, AjusteeKeyListenerBase, AjusteeClientStatus, AjusteeKeyStatus } from './AjusteeClient';
import { esm, valueToEnDateTime, OvrComparer, uiLocale, uiDateTimeFormat } from './utils';
import { KeyUpdateComponent } from './key-update.component';
import { AjusteeClientSvc } from './AjusteeClientSvc';
import envConfig from '../env/config';
import { EnvInfoComponent } from './EnvInfoComponent';

export interface CurrOverride
{
	header: string;
	value: string;
}

const appIdRegExp = /^[a-zA-Z0-9.~]*$/;
const pathRegExp = /^(?:\/?[\-.0-9A-Z_a-z~]+)*\/?$/;

const closedRaw = 0;
const openRaw = 30;
// const closedTable = 100 - openRaw;
const openTable = 100 - closedRaw;

@Directive({selector: '[cc-key-row]'})
export class TrackKeyChangeDirective
{
	@Input() public configKey: ConfigurationKeyVm;
	constructor(public element: ElementRef) {}
}

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})

export class AppComponent implements OnInit
{
	envConfig = envConfig;
	isProcessing = false;
	errDurationSeconds = 3;

	// app.component.html
	status = AjusteeClientStatus.Disconnected;
	initialState: boolean = true;
	isSplitterDisabled = true;
	readonly minRawSize = closedRaw;
	tableSize = openTable;
	rawSize = closedRaw;
	rawSizeExt = openRaw;

	@ViewChildren(TrackKeyChangeDirective) viewconfigKeys !: QueryList<TrackKeyChangeDirective>;
	configKeys: MatTableDataSource<ConfigurationKeyVm>;
	displayedColumns: string[] = ['Key', 'Value', 'DataType', 'TrackKey'];
	subscribedKeys: MatTableDataSource<SubscrConfigurationKey>;
	subscribedKeysMap: Map<string, SubscrConfigurationKey> = new Map();
	ccKeyLogEvents: MatTableDataSource<CcKeyLog>;
	changedKeysCount = 0;
	isCcKeyLogOpened: boolean = false;

	client: AjusteeClient<SubscrConfigurationKey>;

	readonly esm = esm;
	appIdFormControl = new FormControl('', [Validators.pattern(appIdRegExp), Validators.maxLength(32)]);
	pathFormControl = new FormControl('', Validators.pattern(pathRegExp));
	ovrFormControls: OverrideFormControls[] = [
		{paramName: new FormControl(''), value: new FormControl('')},
		{paramName: new FormControl(''), value: new FormControl('')}
	];
	currAppId: string = '';
	currOverrides: OvrComparer = new OvrComparer();
	curPath: string = '';

	unsubscrCompletedPromise: Promise<void>;
	unsubscrCompletedResolve: ()=>void;

	constructor(
		private readonly dialog: MatDialog,
		private readonly toastr: ToastrService,
		private changeDetector: ChangeDetectorRef,
		clientSvc: AjusteeClientSvc
	)
	{
		this.client = clientSvc.client;
		const listeners: AjusteeAllKeysListener<AjusteeKeyListenerBase> =
		{
			onChange: this.handleKeyChange.bind(this),
			onError: this.handleKeyError.bind(this),
			onSubscriptionChange: this.handleSubscrChange.bind(this),
		}
		this.client.allKeysListeners = listeners;
		this.client.statusListener = this.handleStatusChange.bind(this);
		this.client.onError = this.handleError.bind(this);
		this.configKeys = new MatTableDataSource<ConfigurationKeyVm>();
		this.ccKeyLogEvents = new MatTableDataSource<CcKeyLog>();
		this.subscribedKeys = new MatTableDataSource<SubscrConfigurationKey>();
	}

	async ngOnInit(): Promise<void>
	{
		try
		{
			const res = await fetch('config.json');
			const config = await res.json();
			this.appIdFormControl.setValue(config.appId);
		}
		catch(e){}
	}
	// app.component.html

	headerClick()
	{
		if(this.isSplitterDisabled) return;
		this.gutterClick([this.tableSize, this.rawSize]);
	}

	gutterClick(sizes: Array<number>)
	{
		if(this.isSplitterDisabled) return;
		const size = sizes[1];

		if (size === closedRaw)
		{
			this.rawSize = this.rawSizeExt;
			this.tableSize = 100 - this.rawSizeExt;
		}
		else
		{
			this.rawSize = closedRaw;
			this.tableSize = openTable;
		}
	}

	dragEnd(sizes: Array<number>)
	{
		this.tableSize = sizes[0];
		this.rawSize = sizes[1];
		this.rawSizeExt = sizes[1];
	}

	addOverride()
	{
		this.ovrFormControls.push({paramName: new FormControl(''), value: new FormControl('')});
	}

	removeOverride(index: number)
	{
		this.ovrFormControls.splice(index, 1);
	}

	unsubscrCompleted()
	{
		if (!this.unsubscrCompletedPromise) this.unsubscrCompletedPromise = new Promise((resolve)=>{this.unsubscrCompletedResolve = resolve});
		return this.unsubscrCompletedPromise;
	}

	validate ()
	{
		let isValid = true;
		const appId = this.appIdFormControl.value.trim();
		if (!appId)
		{
			this.appIdFormControl.setErrors({required: true});
			isValid = false;
		}
		else if (appId.length < 32)
		{
			this.appIdFormControl.setErrors({minlength: true});
			isValid = false;
		}
		if (this.appIdFormControl.invalid) isValid = false;

		if (this.pathFormControl.invalid) isValid = false;

		const set = new Set<string>()

		for (let control of this.ovrFormControls)
		{
			control.paramName.updateValueAndValidity();

			let paramName = control.paramName.value.trim();
			control.paramName.setValue(paramName);

			const value = control.value.value.trim();
			control.value.setValue(value);

			if(paramName)
			{
				paramName = paramName.toLowerCase();
				if (set.has(paramName))
				{
					control.paramName.setErrors({validator: 'Duplicate name'});
					isValid = false;
				}
				else set.add(paramName);
			}
			else if (value)
			{
				control.paramName.setErrors({required: true});
				isValid = false;
			}
		}
		return isValid;
	}

	async getConfigKeys()
	{
		if (!this.validate()) return;
		this.isProcessing = true;

		try
		{
			const appId = this.appIdFormControl.value;
			const params: HeadersInit = {};
			for (let i=0; i<this.ovrFormControls.length; i++)
			{
				const paramName = this.ovrFormControls[i].paramName.value;
				if (paramName ==='') continue;
				params[paramName] = this.ovrFormControls[i].value.value;
			}
			const path = this.pathFormControl.value;

			this.client.defaultParams = params;
			const isOvrNotChanged = this.currOverrides.compareAndUpdate(this.ovrFormControls)

			if (this.currAppId === appId)
			{
				if (!isOvrNotChanged)
				{
					const subscrKeyList = this.subscribedKeys.data;
					if (subscrKeyList.length > 0)
					{
						for (let i = 0; i < subscrKeyList.length; i++)
						{
							const subscrKey = subscrKeyList[i];
							this.client.removeConfigKeyListener(subscrKey.path);
						}
						await this.unsubscrCompleted();
						this.subscribedKeys.data = [];
					}
					this.changedKeysCount = 0;
					this.ccKeyLogEvents.data = [];
				}
			}
			else
			{
				this.client.appId = appId;
				this.changedKeysCount = 0;
				this.ccKeyLogEvents.data = [];
				this.subscribedKeys.data = [];
				this.subscribedKeysMap.clear();
			}

			const keys = await this.client.getConfigKeys(path);

			for (let key of (keys as ConfigurationKeyVm[]))
			{
				key.viewValue = valueToEnDateTime(key);
				key.isSubscribed = false;
				key.isToggleDisabled = false;
				if (this.subscribedKeysMap.has(key.path)) key.isSubscribed = true;
			}

			this.currAppId = appId;
			this.curPath = path;
			this.configKeys.data = keys as ConfigurationKeyVm[];

			if (this.configKeys.data) this.isSplitterDisabled = false;
			if (this.initialState) this.initialState = false;
		}

		catch(e)
		{
			console.log(e);
			this.toastr.clear();
			this.toastr.error(`Unable to get config keys. ${e.message}`, undefined, {positionClass: 'toast-top-right'});
			this.initialState = true;
			this.changedKeysCount = 0;
			this.ccKeyLogEvents.data = [];
			this.subscribedKeys.data = [];
			this.configKeys.data = [];
			this.subscribedKeysMap.clear();
		}

		this.isProcessing = false;
	}

	subscribe(toggle: any, keyVm: ConfigurationKeyVm)
	{
		keyVm.isToggleDisabled = true;
		keyVm.isSubscribed = true;
		if(toggle.checked)
		{
			const keyInfo: SubscrConfigurationKey =
			{
				path: keyVm.path,
				dataType: keyVm.dataType,
				value: keyVm.value
			}
			this.client.setConfigKeyListener(keyInfo);
		}
		else
		{
			this.client.removeConfigKeyListener(keyVm.path);
		}
	}

	// ws listeners

	handleSubscrChange(keyInfo: SubscrConfigurationKey)
	{
		if (keyInfo.status === AjusteeKeyStatus.Subscribing || keyInfo.status === AjusteeKeyStatus.Unsubscribing) return;
		let keyList = this.configKeys.data;
		for (let keyVm of keyList)
		{
			if (keyVm.path === keyInfo.path)
			{
				keyVm.isToggleDisabled = false;
				keyVm.isSubscribed = keyInfo.status === AjusteeKeyStatus.Subscribed;
				break;
			}
		}
		this.configKeys.data = keyList;

		const subscrKeyList = this.subscribedKeys.data;
		if (keyInfo.status === AjusteeKeyStatus.Subscribed)
		{
			if(!this.subscribedKeysMap.has(keyInfo.path))
			{
				keyInfo.viewValue = valueToEnDateTime(keyInfo)
				subscrKeyList.push(keyInfo);
				this.subscribedKeysMap.set(keyInfo.path, keyInfo);
				this.toastr.success(`The config key ${keyInfo.path} has been successfully subscribed.`);
			}
		}
		else
		{
			this.subscribedKeysMap.delete(keyInfo.path);
			if (!this.unsubscrCompletedResolve)
			{
				for (let i = 0; i < subscrKeyList.length; i++)
				{
					const key = subscrKeyList[i];
					if (key.path === keyInfo.path)
					{
						subscrKeyList.splice(i, 1);
						this.toastr.success(`The config key ${keyInfo.path} has been successfully unsubscribed.`);
						break;
					}
				}
			}
			if (this.subscribedKeysMap.size === 0 && this.unsubscrCompletedResolve)
			{
				this.unsubscrCompletedResolve();
				this.unsubscrCompletedPromise = undefined;
				this.unsubscrCompletedResolve = undefined;
			}

		}
		this.subscribedKeys.data = subscrKeyList;

		this.changeDetector.detectChanges();
	}


	handleKeyChange(keyInfo: SubscrConfigurationKey)
	{
		let keyList = this.configKeys.data;
		for (let key of keyList)
		{
			if (key.path === keyInfo.path)
			{
				const keyLogList = this.ccKeyLogEvents.data;
				const keyLog: CcKeyLog =
				{
					path: keyInfo.path,
					dataType: keyInfo.dataType,
					oldValue: valueToEnDateTime(key),
					newValue: valueToEnDateTime(keyInfo),
					eventTime: new Date().toLocaleString(uiLocale, uiDateTimeFormat)
				}
				keyLogList.push(keyLog);
				if (!this.isCcKeyLogOpened) this.changedKeysCount += 1;
				this.ccKeyLogEvents.data = keyLogList;

				key.value = keyInfo.value;
				key.viewValue = valueToEnDateTime(keyInfo);
				if (key.changedValue != undefined) key.changedValue = undefined;
				break;
			}
		}
		this.configKeys.data = keyList;

		for (let viewKey of this.viewconfigKeys['_results'])
		{
			const path = viewKey.configKey.path;
			if(keyInfo.path === path)
			{
				viewKey.element.nativeElement.classList.add("key-value-changed-2");
				setTimeout(function(){ viewKey.element.nativeElement.classList.remove("key-value-changed-2");; }, 3000);
			}
		}

		keyInfo.viewValue = valueToEnDateTime(keyInfo);

		this.changeDetector.detectChanges();
	}

	handleStatusChange(status: AjusteeClientStatus)
	{
		this.status = status;
		this.changeDetector.detectChanges();
	}

	handleKeyError(keyInfo: AjusteeKeyListenerBase, error: AjusteeKeyListenerCode)
	{
		switch(error)
		{
			case AjusteeKeyListenerCode.AppNotFound:
				this.toastr.error(`The app ${this.appIdFormControl.value} has not been found.`);
			break;
			case AjusteeKeyListenerCode.KeyNotFound:
				this.toastr.error(`The key ${keyInfo.path} has not been found.`);
			break;
			case AjusteeKeyListenerCode.KeyDeleted:
				this.toastr.error(`The key ${keyInfo.path} has been deleted.`);
				let keyList = this.configKeys.data;
				for (let i = 0; i < keyList.length; i++)
				{
					if (keyList[i].path === keyInfo.path)
					{
						keyList.splice(i, 1);
					}
				}
				this.configKeys.data = keyList;

				const subscrKeyList = this.subscribedKeys.data;
				for (let i = 0; i < subscrKeyList.length; i++)
				{
					if (subscrKeyList[i].path === keyInfo.path)
					{
						subscrKeyList.splice(i, 1);
					}
				}
				this.subscribedKeys.data = subscrKeyList;
				this.subscribedKeysMap.delete(keyInfo.path);

				const keyLogList = this.ccKeyLogEvents.data;
				const keyLog: CcKeyLog =
				{
					path: keyInfo.path,
					dataType: keyInfo.dataType,
					oldValue: valueToEnDateTime(keyInfo),
					newValue: 'null',
					eventTime: new Date().toLocaleString(uiLocale, uiDateTimeFormat)
				}
				keyLogList.push(keyLog);
				if (!this.isCcKeyLogOpened) this.changedKeysCount += 1;
				this.ccKeyLogEvents.data = keyLogList;
			break;
			case AjusteeKeyListenerCode.TypeChanged:
				let oldDataType: string;
				for (let key of this.configKeys.data)
				{
					if (key.path === keyInfo.path)
					{
						oldDataType = key.dataType;
					}
				}
				this.toastr.error(`The dataType was changed from ${oldDataType} to ${keyInfo.dataType}.`);
			break;
			default:
				this.toastr.error('Server internal error.');
		}
		this.changeDetector.detectChanges();
	}

	handleError()
	{
		this.toastr.error('Unable to establish connection');
		let keyList = this.configKeys.data;
		for (const key of keyList)
		{
			key.isToggleDisabled = false;
			key.isSubscribed = false;
		}
		this.configKeys.data = keyList;
		this.changeDetector.detectChanges();
	}

	// dialogs

	async showKeyLog()
	{
		this.changedKeysCount = 0;
		this.isCcKeyLogOpened = true;
		const dialogRef = this.dialog.open<KeyChangesComponent, MatTableDataSource<CcKeyLog>>(KeyChangesComponent, {minWidth: '50rem', height: '40rem', disableClose: false, data: this.ccKeyLogEvents});
		await dialogRef.afterClosed().toPromise();
		this.isCcKeyLogOpened = false;
		this.ccKeyLogEvents.data = [];
	}

	async showSubscriptions()
	{
		const dialogRef = this.dialog.open<KeySubscriptionsComponent, MatTableDataSource<SubscrConfigurationKey>>(KeySubscriptionsComponent, {minWidth: '45rem', height: '45rem', disableClose: false, data: this.subscribedKeys});
		await dialogRef.afterClosed().toPromise();
	}

	async updateConfigKey(key: ConfigurationKeyVm)
	{
		const dialogRef = this.dialog.open<KeyUpdateComponent, ConfigurationKeyVm, ConfigurationKeyVm|undefined>(KeyUpdateComponent, {minWidth: '40rem', disableClose: false, data: key});
		const updatedKey = await dialogRef.afterClosed().toPromise();
		if (!updatedKey) return;
		this.toastr.success(`The config key ${updatedKey.path} has been successfully updated.`);
	}

	showInfo()
	{
		this.dialog.open<EnvInfoComponent, undefined, void>(EnvInfoComponent, {minWidth: '40rem', disableClose: false});
	}
}
