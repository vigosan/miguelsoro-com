import { Client, Environment } from '@paypal/paypal-server-sdk';

const environment = process.env.PAYPAL_ENVIRONMENT === 'production' ? Environment.Live : Environment.Sandbox;

export const paypalClient = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
    oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET!,
  },
  environment,
});

export const getPayPalClientConfig = () => ({
  'client-id': process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
  currency: 'EUR',
  intent: 'capture',
  'data-client-token': undefined,
  environment: environment === Environment.Live ? 'production' : 'sandbox',
});