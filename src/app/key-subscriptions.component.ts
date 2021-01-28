import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { AjusteeClient, ConfigurationKey } from '@ajustee/ajustee-client-web';
import { KeyUpdateComponent } from './key-update.component';
import { ToastrService } from 'ngx-toastr';
import { CcKeyLog, SubscrConfigurationKey } from './models';
import { observableToPromise } from './utils';
import { AjusteeClientSvc } from './AjusteeClientSvc';

interface ConfigurationKeyVmSubscr extends ConfigurationKey
{
	isBlocked: boolean;
}

@Component({
	templateUrl: './key-subscriptions.component.html',
	styleUrls: ['./app.component.scss'],
})

export class KeySubscriptionsComponent
{
	displayedColumns: string[] = ['Key', 'Value',  'DataType', 'Actions'];

	client: AjusteeClient;

	constructor
	(
		public readonly dialogRef: MatDialogRef<KeySubscriptionsComponent, void>,
		@Inject(MAT_DIALOG_DATA) public readonly configKeys: MatTableDataSource<SubscrConfigurationKey>,
		ajusteeClientSvc: AjusteeClientSvc
	)
	{
		this.client = ajusteeClientSvc.client;
	}

	unsubscribe(key: SubscrConfigurationKey)
	{
		key.isBlocked = true;
		this.client.removeConfigKeyListener(key.path);
	}
}