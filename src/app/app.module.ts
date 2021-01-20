import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import {HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatNativeDateModule} from '@angular/material/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatInputModule} from '@angular/material/input';
import { MatIconRegistry } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatCardModule} from '@angular/material/card';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';

import { AngularSplitModule } from 'angular-split';

import { AppComponent, TrackKeyChangeDirective } from './app.component';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatTableModule} from '@angular/material/table';
import {CdkTableModule} from '@angular/cdk/table';
import { NgxLoadingModule, ngxLoadingAnimationTypes } from 'ngx-loading';
import { CcSplitterComponent } from './cc-splitter/cc-splitter.component';
import { CcSplitterAreaDirective } from './cc-splitter/cc-splitter-area.directive';

import { registerLocaleData } from '@angular/common';
import localeRu from '@angular/common/locales/ru';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatBadgeModule} from '@angular/material/badge';
import { KeyChangesComponent } from './key-changes.component';
import { KeySubscriptionsComponent } from './key-subscriptions.component';
import {MatDialogModule} from '@angular/material/dialog';
import { ToastrModule } from 'ngx-toastr';
import { KeyUpdateComponent } from './key-update.component';
import { CcDatePicker, CcDateTimePicker } from './CcDateTimePicker';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { AjusteeClientSvc } from './AjusteeClientSvc';
import { EnvInfoComponent } from './EnvInfoComponent';


@NgModule({
	declarations: [
		AppComponent,
		EnvInfoComponent,
		KeyUpdateComponent,
		KeyChangesComponent,
		KeySubscriptionsComponent,
		CcSplitterComponent,
		CcSplitterAreaDirective,
		TrackKeyChangeDirective,
		CcDateTimePicker,
		CcDatePicker
	],
	providers: [AjusteeClientSvc],
	imports: [
		BrowserModule,

		MatInputModule,
		BrowserAnimationsModule,
		FormsModule,
		HttpClientModule,
		MatNativeDateModule,
		ReactiveFormsModule,
		MatSidenavModule,
		MatExpansionModule,
		MatButtonModule,
		MatProgressSpinnerModule,
		MatCardModule,
		MatPaginatorModule,
		MatTableModule,
		MatGridListModule,
		CdkTableModule,
		MatCardModule,
		MatSnackBarModule,
		MatIconModule,
		MatSlideToggleModule,
		MatBadgeModule,
		MatMenuModule,
		MatDialogModule,
		AngularSplitModule.forRoot(),
		ToastrModule.forRoot({ positionClass: "cc-toast-top-right" }),
		NgxLoadingModule,
		MatDatepickerModule,
		MatCheckboxModule,
		MatToolbarModule,
		NgxLoadingModule.forRoot(
		{
			animationType: ngxLoadingAnimationTypes.doubleBounce,
			backdropBackgroundColour: 'rgba(0,0,0,0.1)',
			backdropBorderRadius: '4px',
			primaryColour: '#2962ff',
			secondaryColour: '#d50000',
			tertiaryColour: '#00c853'
		}),
	],
	entryComponents: [KeyChangesComponent, KeySubscriptionsComponent, KeyUpdateComponent],
	bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
		iconRegistry: MatIconRegistry,
		domSanitizer: DomSanitizer,
	)
	{
		iconRegistry.addSvgIcon('delete', domSanitizer.bypassSecurityTrustResourceUrl('assets/delete.svg'));
		iconRegistry.addSvgIcon('cancel', domSanitizer.bypassSecurityTrustResourceUrl('assets/cancel.svg'));
		iconRegistry.addSvgIcon('add', domSanitizer.bypassSecurityTrustResourceUrl('assets/add.svg'));
		iconRegistry.addSvgIcon('arrow', domSanitizer.bypassSecurityTrustResourceUrl('assets/arrow.svg'));
		iconRegistry.addSvgIcon('info', domSanitizer.bypassSecurityTrustResourceUrl('assets/info.svg'));
		registerLocaleData(localeRu, 'ru');
	}
}
