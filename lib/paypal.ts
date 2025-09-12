import { Client, Environment, OrdersController } from '@paypal/paypal-server-sdk';

const environment = process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT === 'production' ? Environment.Production : Environment.Sandbox;

export const paypalClient = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
    oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET!,
  },
  environment,
});

export const ordersController = new OrdersController(paypalClient);

export const getPayPalClientConfig = () => {
  const config = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
    currency: 'EUR',
    intent: 'capture',
    'data-client-token': undefined,
    environment: (environment === Environment.Production ? 'production' : 'sandbox') as 'production' | 'sandbox',
  };
  
  console.log('PayPal Config:', config);
  console.log('Environment variable:', process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT);
  console.log('Computed environment:', environment);
  
  return config;
};