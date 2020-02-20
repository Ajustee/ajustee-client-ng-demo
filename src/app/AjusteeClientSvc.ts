import { AjusteeClient } from "./AjusteeClient";
import { Injectable } from '@angular/core';
import { SubscrConfigurationKey } from './models';


@Injectable()
export class AjusteeClientSvc 
{
	client: AjusteeClient<SubscrConfigurationKey> = new AjusteeClient(apiUrlFo, apiWsUrlFo);
	constructor() {}
}