const express = require("express");
const stripe = require("stripe")(
  "sk_test_51R3cXYJzUM40G4XlUJ52yvOZ2oKz1bloGpRivWBn69HyZ2ruQ5HfYh84RlvoPiqoqq1CE4fSNVwsCJScSAqTQtlL00s4jOeEKC"
); // Replace with your Stripe secret key
const app = express();

app.use(express.json());

app.post("/create-payment-intent", async (req, res) => {
  const { amount } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Amount in cents
      currency: "usd",
      payment_method_types: ["card", "apple_pay", "google_pay"],
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
