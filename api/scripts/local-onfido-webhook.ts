import { Configuration, DefaultApi, Region } from '@onfido/api';
import * as ngrok from 'ngrok';

async function main() {
  const onfidoApiToken = process.env.ONFIDO_API_TOKEN;

  if (!onfidoApiToken) {
    throw new Error(
      'ONFIDO_API_TOKEN is not set. Please export it in your environment before running this script.',
    );
  }
  const port = 4000;

  console.log('starting ngrok...');
  const url = await ngrok.connect(port);
  console.log('ngrok url:', url);

  const onfido = new DefaultApi(
    new Configuration({
      apiToken: onfidoApiToken,
      region: Region.EU, // Supports Region.EU, Region.US and Region.CA
      baseOptions: { timeout: 60_000 }, // Additional Axios options (timeout, etc.)
    }),
  );

  const result = await onfido.createWebhook({
    url: `${url}/kyc/webhook`,
    environments: ['sandbox'],
    // events: ['check.completed'],
  });

  console.log('webhook:');
  console.log(result);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
