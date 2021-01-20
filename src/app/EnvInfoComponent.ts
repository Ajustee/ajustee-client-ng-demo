import { Component } from '@angular/core';
import envConfig from '../env/config';

@Component({
	templateUrl: './EnvInfoComponent.html'
})

export class EnvInfoComponent
{
	envConfig = envConfig;
}
