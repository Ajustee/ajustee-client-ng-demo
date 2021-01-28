import { DataType, ConfigurationKey, AjusteeKeyListener } from '@ajustee/ajustee-client-web';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';

export interface ConfigurationKeyVm extends ConfigurationKey
{
	isSubscribed: boolean;
	isToggleDisabled: boolean;
	viewValue?: any;
	changedValue?: any;
}

export interface CcKeyLog
{
	path: string;
	dataType: DataType;
	oldValue: any;
	newValue: any;
	eventTime: string;
}

export interface OverrideFormControls
{
	paramName: TypedFormControl<string>;
	value: TypedFormControl<string>;
}

export interface TypedFormControl<T> extends FormControl
{
	value: T;
	setValue(value: T, options?: Object): void;
	patchValue(value: T, options?: Object): void;
	reset(value?: T, options?: Object): void;
	readonly valueChanges: Observable<T>;
}

export interface SubscrConfigurationKey extends AjusteeKeyListener<SubscrConfigurationKey>
{
	viewValue?: any;
	isBlocked?: boolean;
}