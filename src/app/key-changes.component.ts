import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { CcKeyLog } from './models';

@Component({
	templateUrl: './key-changes.component.html',
	styleUrls: ['./app.component.scss'],
})

export class KeyChangesComponent
{
	displayedColumns: string[] = ['EventTime', 'Key', 'OldValue', 'NewValue', 'DataType'];
	
	constructor(
		public readonly dialogRef: MatDialogRef<KeyChangesComponent, CcKeyLog>,
		@Inject(MAT_DIALOG_DATA) public readonly configKeys: MatTableDataSource<CcKeyLog>,
	)
	{}
}