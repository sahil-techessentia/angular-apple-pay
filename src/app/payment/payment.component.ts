import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  StripeService,
  NgxStripeModule,
  StripePaymentRequestButtonComponent,
} from 'ngx-stripe';
import {
  loadStripe,
  Stripe,
  StripeElements,
  StripeCardElement,
} from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment.stripe';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxStripeModule,
    StripePaymentRequestButtonComponent,
  ],
  providers: [StripeService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss',
})
export class PaymentComponent implements OnInit {
  paymentForm: FormGroup;
  stripe: Stripe | null = null;
  cardError: string | null = null;
  loading = false;
  paymentRequest: any;

  cardOptions = {
    style: {
      base: { fontSize: '16px', color: '#32325d' },
    },
  };

  constructor(
    private fb: FormBuilder,
    public stripeService: StripeService,
    private http: HttpClient
  ) {
    this.paymentForm = this.fb.group({});
  }

  async ngOnInit() {
    // Load Stripe.js
    this.stripe = await loadStripe(environment.stripe.publishableKey);
    if (!this.stripe) {
      this.cardError = 'Failed to load Stripe';
      return;
    }

    // Initialize Stripe service
    this.stripeService.setKey(environment.stripe.publishableKey);

    // Check for Apple Pay/Google Pay support
    this.paymentRequest = this.stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: { label: 'Total', amount: 2500 }, // Amount in cents ($25)
      requestPayerName: true,
      requestPayerEmail: true,
      requestShipping: false,
    });

    const result = await this.paymentRequest.canMakePayment();
    if (!result) {
      this.paymentRequest = null; // Hide button if not supported
    }
  }

  async pay() {
    if (!this.stripe) {
      this.cardError = 'Stripe not initialized';
      return;
    }

    this.loading = true;
    this.cardError = null;

    try {
      // Create a PaymentIntent on your backend
      // const paymentIntent = await firstValueFrom(
      //   this.http.post<{ clientSecret: string }>(
      //     'https://astonishing-selkie-3a9452.netlify.app/.netlify/functions/create-payment-intent',
      //     {
      //       amount: 2500,
      //     }
      //   )
      // );
      const paymentIntent = await this.http
        .post<{ clientSecret: string }>(
          'https://astonishing-selkie-3a9452.netlify.app/.netlify/functions/create-payment-intent',
          { amount: 2500 }
        )
        .toPromise();

      if (!paymentIntent) {
        this.cardError = 'Failed to create payment intent';
        return;
      }

      // Confirm card payment
      const elements = await firstValueFrom(this.stripeService.elements());
      if (!elements) {
        this.cardError = 'Failed to initialize Stripe elements';
        return;
      }

      const cardElement = elements.getElement('card') as StripeCardElement;
      if (!cardElement) {
        this.cardError = 'Card element not found';
        return;
      }

      const result = await firstValueFrom(
        this.stripeService.confirmCardPayment(paymentIntent.clientSecret, {
          payment_method: { card: cardElement },
        })
      );

      if (!result) {
        this.cardError = 'Payment failed';
        return;
      }

      if (result.error) {
        this.cardError = result.error.message || 'Payment failed';
      } else {
        alert('Payment successful!');
      }
    } catch (error) {
      this.cardError = 'An error occurred during payment';
    } finally {
      this.loading = false;
    }
  }

  async handlePaymentMethod(event: { paymentMethod: { id: string } }) {
    if (!this.stripe) {
      this.cardError = 'Stripe not initialized';
      return;
    }

    this.loading = true;

    try {
      // Create PaymentIntent on backend
      const paymentIntent = await this.http
        .post<{ clientSecret: string }>(
          'https://astonishing-selkie-3a9452.netlify.app/.netlify/functions/create-payment-intent',
          { amount: 2500 }
        )
        .toPromise();

      if (!paymentIntent) {
        this.cardError = 'Failed to create payment intent';
        return;
      }

      // Confirm PaymentRequest payment (Apple Pay/Google Pay)
      const result = await this.stripe.confirmCardPayment(
        paymentIntent.clientSecret,
        {
          payment_method: event.paymentMethod.id,
        }
      );

      if (result.error) {
        this.cardError = result.error.message || 'Payment failed';
      } else {
        alert('Payment successful via Apple Pay/Google Pay!');
      }
    } catch (error) {
      this.cardError = 'An error occurred during payment';
    } finally {
      this.loading = false;
    }
  }
}
