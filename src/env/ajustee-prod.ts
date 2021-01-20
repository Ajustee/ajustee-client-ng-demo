import { enableProdMode } from '@angular/core';
import { EnvConfig } from "../EnvConfig";

enableProdMode();

export default <EnvConfig>
{
	name: 'prod',
	apiUrlFo: 'https://api.ajustee.com',
	apiWsUrlFo: 'wss://ws.ajustee.com',
}
