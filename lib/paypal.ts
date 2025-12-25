import paypal from '@paypal/checkout-server-sdk';

// Validar variables de entorno
function validatePayPalConfig() {
  const required = [
    'PAYPAL_CLIENT_ID',
    'PAYPAL_CLIENT_SECRET', 
    'PAYPAL_ENVIRONMENT'
  ];

  for (const envVar of required) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

}

// Ejecutar validación al cargar el módulo
validatePayPalConfig();

const configureEnvironment = () => {
  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;

  if (process.env.PAYPAL_ENVIRONMENT === 'live') {
    return new paypal.core.LiveEnvironment(clientId, clientSecret);
  } else {
    return new paypal.core.SandboxEnvironment(clientId, clientSecret);
  }
};

export const paypalClient = new paypal.core.PayPalHttpClient(configureEnvironment());