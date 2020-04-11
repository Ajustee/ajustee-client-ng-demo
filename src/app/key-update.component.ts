import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { ConfigurationKey, AjusteeClient, DataType } from './AjusteeClient';
import { esm, dateTimeIso8601ToUi, dateIso8601ToUi } from './utils';
import { AjusteeClientSvc } from './AjusteeClientSvc';
import { ConfigurationKeyVm } from './models';

@Component({
	templateUrl: './key-update.component.html',
	styleUrls: ['./key-update.component.scss'],
})
export class KeyUpdateComponent
{
	isProcessing = false;
	valueFormControl = new FormControl();
	client: AjusteeClient;
	readonly esm = esm;

	constructor(
		public readonly dialogRef: MatDialogRef<KeyUpdateComponent, ConfigurationKey>,
		@Inject(MAT_DIALOG_DATA) public readonly key: ConfigurationKeyVm,
		ajusteeClient: AjusteeClientSvc
	)
	{
		this.client = ajusteeClient.client;
		const value = key.changedValue == undefined ? key.value : key.changedValue;
		switch (this.key.dataType)
		{
			case DataType.Date:
			case DataType.DateTime:
				let strValue = value as string;
				if (strValue.endsWith('Z')) strValue = strValue.substr(0, strValue.length-1);
				this.valueFormControl = new FormControl(new Date(strValue));
			break;
			default:
				this.valueFormControl = new FormControl(value);
		}
	}

	validate ()
	{
		let isValid = true;

		let value = this.valueFormControl.value;
		if (value == undefined)
		{
			this.valueFormControl.setErrors({required: true});
			isValid = false;
		}
		else if((!this.key.changedValue && value === this.key.value) || value === this.key.changedValue)
		{
			this.valueFormControl.setErrors({sameValue: true});
			isValid = false;
		}
		if(this.key.dataType === DataType.String)
		{
			value = value.trim();
			if (!value)
			{
				this.valueFormControl.setErrors({required: true});
				isValid = false;
			}
		}
		return isValid;
	}

	async submit()
	{
		if (!this.validate()) return;

		this.isProcessing = true;
		try
		{
			let newValue: any;
			let changedValue: any;
			switch(this.key.dataType)
			{
				case DataType.Integer:
					newValue = this.valueFormControl.value.toString();
					changedValue = newValue;
				break;

				case DataType.Date:
				{
					const date = this.valueFormControl.value as Date;
					newValue = new Date(date.getTime() - date.getTimezoneOffset()*60*1000);
					newValue = newValue.toJSON();
					const i = newValue.indexOf('T');
					newValue = newValue.substring(0, i);
					changedValue = dateIso8601ToUi(newValue);
					break;
				}
				case DataType.DateTime:
				{
					const date = this.valueFormControl.value as Date;
					newValue = new Date(date.getTime() - date.getTimezoneOffset()*60*1000);
					newValue = newValue.toJSON();
					changedValue = dateTimeIso8601ToUi(newValue);
				}
				break;

				default:
					newValue = this.valueFormControl.value;
					changedValue = newValue;
			}
			await this.client.updateConfigKey(this.key.path, newValue);

			if(changedValue === this.key.viewValue) this.key.changedValue = undefined;
			else this.key.changedValue = changedValue;

			this.dialogRef.close(this.key);
		}
		catch(e)
		{
			console.log(e);
			this.dialogRef.close(undefined);
		}
		this.isProcessing = false;
	}
}
