export const environment = {
  production: false,
  stripe: {
    publishableKey:
      'pk_test_51R5JbSFRqoNtB6TuT28YTxUsF4DUtKwEz1JIAMnv5m7fFOftmkR6bahNTYKBYWmdgyvlCXAuiqQ1ATF523BEXRvV00ejjl5p7a',
    secretKey:
      'sk_test_51R5JbSFRqoNtB6TuqysoiS4Bzft78p8zqKTrUaA3oLWDhCBdBucwZBLIBmDRuRz4qhiDUGdyqZq2CqNmY5gnbCHn00VoW7DHsF',
    webhookSecret: 'your_webhook_secret_here',
    defaultCurrency: 'usd',
    successUrl: 'http://localhost:4200/success',
    cancelUrl: 'http://localhost:4200/cancel',
  },
};
