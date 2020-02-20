import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { ConfigurationKey, AjusteeClient, DataType } from './AjusteeClient';
import { esm, toEnDate, toEnDateTime } from './utils';
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
		if (!key.changedValue) this.valueFormControl = new FormControl(key.value);
		else 
		{
			let value: any;
			switch (this.key.dataType)
			{
				case DataType.Date:
				case DataType.DateTime:
					value = new Date(key.changedValue);
				break;
				default:
					value = key.changedValue
			}
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
			const formCtValue = this.valueFormControl.value;
			let newValue: any;
			let changedValue: any;
			switch(this.key.dataType)
			{
				case DataType.Integer:
					newValue = formCtValue.toString();
					changedValue = newValue;
				break;

				case DataType.Date:
					newValue = new Date(formCtValue.getTime() - formCtValue.getTimezoneOffset()*60*1000);
					newValue = newValue.toJSON();
					const i = newValue.indexOf('T');
					newValue = newValue.substring(0, i);
					changedValue = toEnDate(newValue);
				break;

				case DataType.DateTime:
					newValue = formCtValue.toJSON();
					changedValue = toEnDateTime(newValue);
				break;

				default:
					newValue = formCtValue;
					changedValue = formCtValue;
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