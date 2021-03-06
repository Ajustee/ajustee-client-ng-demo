import { AjusteeClient } from "@ajustee/ajustee-client-web";
import { Injectable } from '@angular/core';
import { SubscrConfigurationKey } from './models';
import envConfig from '../env/config';

@Injectable()
export class AjusteeClientSvc
{
	client: AjusteeClient<SubscrConfigurationKey> = new AjusteeClient(envConfig.apiUrlFo, envConfig.apiWsUrlFo);
	constructor() {}
}
