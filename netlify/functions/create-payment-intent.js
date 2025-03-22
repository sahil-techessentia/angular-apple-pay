const stripe = require("stripe")(
  "sk_test_51R3cXYJzUM40G4XlUJ52yvOZ2oKz1bloGpRivWBn69HyZ2ruQ5HfYh84RlvoPiqoqq1CE4fSNVwsCJScSAqTQtlL00s4jOeEKC"
);

exports.handler = async (event, context) => {
  try {
    // Parse the incoming request body
    const { amount } = JSON.parse(event.body);

    // Create a PaymentIntent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Amount in cents
      currency: "usd",
      payment_method_types: ["card"],
    });

    // Return the client secret to the frontend
    return {
      statusCode: 200,
      body: JSON.stringify({ clientSecret: paymentIntent.client_secret }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
