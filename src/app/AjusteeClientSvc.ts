import { AjusteeClient } from "./AjusteeClient";
import { Injectable } from '@angular/core';
import { SubscrConfigurationKey } from './models';

const wsUrl = 'wss://2tb5h9sk53.execute-api.us-west-2.amazonaws.com/ws';

@Injectable()
export class AjusteeClientSvc 
{
	client: AjusteeClient<SubscrConfigurationKey> = new AjusteeClient(apiUrlFo, wsUrl);
	constructor() {}
}