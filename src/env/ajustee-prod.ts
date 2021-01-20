import { enableProdMode } from '@angular/core';
import { EnvConfig } from "../EnvConfig";

enableProdMode();

export default <EnvConfig>
{
	name: 'prod',
	isProd: true,
	apiUrlFo: 'https://va12w5ncz8.execute-api.us-west-2.amazonaws.com/fo',
	apiWsUrlFo: 'wss://imn16ypehe.execute-api.us-west-2.amazonaws.com/ws',
}
