import { Component, ViewChild, Input, Output, EventEmitter, SimpleChanges, OnChanges, Injectable, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Platform } from '@angular/cdk/platform';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { MAT_DATE_FORMATS, NativeDateAdapter, DateAdapter } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { esm, uiLocale, uiDateFormatter, DateTimeFormatter, uiDateFormat } from '../utils';

const monthYearLabel: Intl.DateTimeFormatOptions = {year: 'numeric', month: 'short'};
const dateA11yLabel: Intl.DateTimeFormatOptions = {year: 'numeric', month: 'long', day: 'numeric'};
const monthYearA11yLabel: Intl.DateTimeFormatOptions = {year: 'numeric', month: 'long'};


const monthYearLabelFormatter = new Intl.DateTimeFormat(uiLocale, monthYearLabel);
const dateA11yLabelFormatter = new Intl.DateTimeFormat(uiLocale, dateA11yLabel);
const monthYearA11yLabelFormatter = new Intl.DateTimeFormat(uiLocale, monthYearA11yLabel);

@Injectable()
export class DateTimeAdapter extends NativeDateAdapter
{


	constructor(platform: Platform)
	{
		super(uiLocale, platform);
	}

	addCalendarMonths(date: Date, months: number): Date
	{
		return new Date(date.getFullYear(), date.getMonth() + months, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
	}

	addCalendarDays(date: Date, days: number): Date
	{
		return new Date(date.getFullYear(), date.getMonth(), date.getDate()+days, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
	}

	toIso8601(date: Date): string
	{
		return date.toISOString();
	}

	getFormatter(displayFormat: Object): Intl.DateTimeFormat|DateTimeFormatter
	{
		switch(displayFormat)
		{
			case uiDateFormat: return uiDateFormatter;
			case monthYearLabel: return monthYearLabelFormatter;
			case dateA11yLabel: return dateA11yLabelFormatter;
			case monthYearA11yLabel: return monthYearA11yLabelFormatter;
			default: throw new Error('Unknown format.');
		}
	}

	format(date: Date, displayFormat: DateTimeFormatter): string
	{

		if (!this.isValid(date)) throw Error('NativeDateAdapter: Cannot format invalid date.');
		return displayFormat.format(date);
	}

	parse(value: any): Date
	{
		return new Date(value);
	}

	compareDate(first: Date, second: Date): number
	{
        return first.getTime() - second.getTime();
    }
}

@Component(
{
	selector: 'datetime-picker',
	templateUrl: './datetime-picker.component.html',
	providers:
	[
		{
			provide: MAT_DATE_FORMATS,
			useValue:
			{
				parse:
				{
					dateInput: null,
				},
				display:
				{
					dateInput: uiDateFormatter,
					monthYearLabel: monthYearLabelFormatter,
					dateA11yLabel: dateA11yLabelFormatter,
					monthYearA11yLabel: monthYearA11yLabelFormatter,
				}
			}
		},
		{
			provide: DateAdapter,
			useClass: DateTimeAdapter
		},
	],
})
export class DateTimePickerComponent implements OnChanges
{
	@ViewChild('checkbox', { static: true }) checkbox: MatCheckbox;

	@Input() isOptional = false;
	@Input() isSet = false;
	@Output() isSetChange = new EventEmitter<boolean>();

	@Input('form-control') formControl: FormControl;
	readonly esm = esm;

	private readonly enable: ()=>void;
	private readonly disable: ()=>void;

	constructor()
	{
		this.enable = ()=>this.formControl.enable();
		this.disable = ()=>this.formControl.disable();
	}

	ngOnChanges(changes: SimpleChanges)
	{
		if (this.isOptional)
		{
			const isSetItem = changes['isSet'];
			if (isSetItem)
			{
				this.checkbox.writeValue(this.isSet);
				if (this.isSet)	setTimeout(this.enable);
				else setTimeout(this.disable);
			}
		}
		else if (changes['isOptional'])
		{
			setTimeout(this.enable);
		}
	}

	handleIsSetChange(event: MatCheckboxChange)
	{
		const value = event.checked;
		if (this.isSet == value) return;
		this.isSet = value;
		this.isSetChange.emit(value)
	}

}

@Component(
{
	// moduleId: module.id,
	selector: 'cc-datepicker',
	template: '',
	exportAs: 'matDatepicker',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
})
export class CcDateTimePicker extends  MatDatepicker<Date>
{
	select(date: Date): void
	{
		let oldValue = this._selected;
		if (oldValue) date.setHours(oldValue.getHours(), oldValue.getMinutes(), oldValue.getSeconds(), oldValue.getMilliseconds());
		this._selected = date;
		if (!(this as any)._dateAdapter.sameDate(oldValue, this._selected))
		{
			this._selectedChanged.next(date);
		}
	}
}


