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

export const uiLocale = 'en-us';
export const uiDateFormat: Intl.DateTimeFormatOptions = {year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: '2-digit' };
export const uiDateFormatter = new DateTimeFormatter(new Intl.DateTimeFormat(uiLocale, uiDateFormat));
export const dateIso8601ToUi = (dateTime: string) => uiDateFormatter.format(new Date(dateTime.substr(0, 23)));

export const uiDateTimeMinutesFormat: Intl.DateTimeFormatOptions = {year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit' };
export const uiDateTimeMinutesFormatter = new Intl.DateTimeFormat(uiLocale, uiDateTimeMinutesFormat);
export const dateIso8601ToUiMinutes = (dateTime: string) => uiDateTimeMinutesFormatter.format(new Date(dateTime.substr(0, 16)));

const enUsDayDateFormatter = new Intl.DateTimeFormat("en-us", {year: 'numeric', month: 'numeric', day: 'numeric'})

export const dayDateIso8601ToUi = (en: string) =>
{
	// const year = en.substr(0, 4);
	// const month = en.charCodeAt(5) === 48 ? en.substr(6, 1) : en.substr(5, 2);
	// const day = en.charCodeAt(8) === 48 ? en.substr(9, 1) : en.substr(8, 2);
	// return month + '/' + day + '/' + year;
	return enUsDayDateFormatter.format(new Date(en));
}


export const getEnDateTime= () => 
{
	const today = new Date();
	const date = today.toLocaleDateString('en-US');
	const time = today.toLocaleTimeString('en-US');
	return date + ' ' + time;
}

export const toEnDate = (date: string) => 
{
	const enDate = new Date(date);
	return enDate.toLocaleDateString('en-US');
}

export const toEnDateTime = (dateTime: string) => 
{
	const enDateTime = new Date(dateTime);
	const date = enDateTime.toLocaleDateString('en-US');
	const time = enDateTime.toLocaleTimeString('en-US');
	return date + ' ' + time;
}

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
			value = toEnDate(key.value.toString());
			break;
		}
		case DataType.DateTime:
		{
			value = toEnDateTime(key.value.toString());
			break;
		}
		default:
			value = key.value;
	}
	return value;
}