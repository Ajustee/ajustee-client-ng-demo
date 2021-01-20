import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import './env/config';

platformBrowserDynamic()
	.bootstrapModule(AppModule)
	.catch(err => console.error(err));
