import { Observable } from 'rxjs';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormControl } from '@angular/forms';
import { ConfigurationKey, DataType, AjusteeKeyListenerBase } from './AjusteeClient';
import { OverrideFormControls } from './models';

export const observableToPromise = <T> (observable: Observable<T>) => new Promise<T>(observable.subscribe.bind(observable));


export class ESM implements ErrorStateMatcher
{
  isErrorState(control: FormControl): boolean
  {
    return control.invalid;
  }
}
export const esm = new ESM();



export const uiLocale = 'en-us';
const uiDateFormatter = new Intl.DateTimeFormat(uiLocale, {year: 'numeric', month: 'numeric', day: 'numeric'})
export const dateIso8601ToUi = (en: string) => uiDateFormatter.format(new Date(en));

export class DateTimeFormatter
{
	constructor(private readonly formatter: Intl.DateTimeFormat)
	{
	}

	format(date: Date): string
	{
		const ms = date.getMilliseconds();
		const str = this.formatter.format(date);
		if (ms === 0) return str;
		const len = str.length;
		const str1 = str.substr(0, len-3);
		const str2 = str.substr(len-3, 3);
		if (ms < 10) return str1 + '.00' + ms.toString(10) + str2;
		if (ms < 100) return str1 + '.0' + ms.toString(10) + str2;
		return str1 + '.' + ms.toString(10) + str2;
	}
}

export const uiDateTimeFormat: Intl.DateTimeFormatOptions = {year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: '2-digit' };
export const uiDateTimeFormatter = new DateTimeFormatter(new Intl.DateTimeFormat(uiLocale, uiDateTimeFormat));
export const dateTimeIso8601ToUi = (dateTime: string) => uiDateTimeFormatter.format(new Date(dateTime.substr(0, 23)));



export class OvrComparer extends Map<string, { flag: boolean, value: string}>
{
	private _flag = false;

	compareAndUpdate(controls: OverrideFormControls[])
	{
		let isEqual = true;
		for (const control of controls)
		{
			const paramName = control.paramName.value.toLowerCase();
			if (!paramName) continue;
			else
			{
				const currValue = this.get(paramName);
				const value = control.value.value;

				if (!currValue)
				{
					isEqual = false;
					this.set(paramName, {flag: this._flag, value: value});
				}
				else
				{
					currValue.flag = this._flag;
					if (value !== currValue.value)
					{
						isEqual = false;
						currValue.value = value;
					}
				}
			}
		}

		for(const [key, mapValue] of this)
		{
			if (mapValue.flag !== this._flag)
			{
				this.delete(key);
				isEqual = false;
			}
		}

		this._flag = !this._flag;
		return isEqual;
	}
}

export const valueToEnDateTime = (key: ConfigurationKey|AjusteeKeyListenerBase) =>
{
	let value: any;
	switch(key.dataType)
	{
		case DataType.Date:
		{
			value = dateIso8601ToUi(key.value.toString());
			break;
		}
		case DataType.DateTime:
		{
			value = dateTimeIso8601ToUi(key.value.toString());
			break;
		}
		default:
			value = key.value;
	}
	return value;
}
