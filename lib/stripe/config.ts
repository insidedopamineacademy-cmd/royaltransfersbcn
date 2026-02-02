/**
 * Stripe Configuration
 * Centralized Stripe client initialization for server-side use only
 * 
 * SECURITY NOTE: This file should ONLY be imported in API routes (server-side).
 * Never import this in client components or pages.
 */

import Stripe from 'stripe';

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error(
    '❌ STRIPE_SECRET_KEY is not defined in environment variables. ' +
    'Please add it to your .env.local file.'
  );
}

// Validate key format (should start with sk_test_ or sk_live_)
if (!stripeSecretKey.startsWith('sk_')) {
  throw new Error(
    '❌ Invalid STRIPE_SECRET_KEY format. ' +
    'Secret keys should start with "sk_test_" or "sk_live_"'
  );
}

// ============================================================================
// STRIPE CLIENT INITIALIZATION
// ============================================================================

/**
 * Stripe client instance
 * Configured with TypeScript support
 */
export const stripe = new Stripe(stripeSecretKey, {
  typescript: true,
  appInfo: {
    name: 'Royal Transfers BCN',
    version: '1.0.0',
  },
});

// ============================================================================
// STRIPE CONFIGURATION CONSTANTS
// ============================================================================

/**
 * Stripe Checkout Session configuration
 */
export const STRIPE_CONFIG = {
  /**
   * Currency for all transactions
   */
  currency: 'eur' as const,

  /**
   * Payment methods to accept
   */
  paymentMethodTypes: ['card'] as const,

  /**
   * Checkout session mode
   */
  mode: 'payment' as const,

  /**
   * Session expiration time (in seconds)
   * Default: 30 minutes
   */
  expiresAfter: 30 * 60,

  /**
   * Billing address collection
   */
  billingAddressCollection: 'auto' as const,

  /**
   * Customer creation mode
   */
  customerCreation: 'if_required' as const,

  /**
   * Locale for Stripe Checkout UI
   * Supported: auto, en, es, de, it, etc.
   */
  locale: 'auto' as const,
} as const;

// ============================================================================
// WEBHOOK CONFIGURATION
// ============================================================================

/**
 * Webhook secret for signature verification
 * Only needed if you're using webhooks
 */
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Events to listen for in webhook handler
 */
export const WEBHOOK_EVENTS = {
  CHECKOUT_COMPLETED: 'checkout.session.completed',
  CHECKOUT_EXPIRED: 'checkout.session.expired',
  PAYMENT_SUCCEEDED: 'payment_intent.succeeded',
  PAYMENT_FAILED: 'payment_intent.payment_failed',
} as const;

// ============================================================================
// METADATA KEYS
// ============================================================================

/**
 * Standard metadata keys for Stripe objects
 * Used to store booking information in Stripe sessions
 */
export const METADATA_KEYS = {
  BOOKING_ID: 'bookingId',
  CUSTOMER_NAME: 'customerName',
  CUSTOMER_EMAIL: 'customerEmail',
  CUSTOMER_PHONE: 'customerPhone',
  SERVICE_TYPE: 'serviceType',
  PICKUP_ADDRESS: 'pickupAddress',
  DROPOFF_ADDRESS: 'dropoffAddress',
  PICKUP_DATE: 'pickupDate',
  PICKUP_TIME: 'pickupTime',
  VEHICLE_NAME: 'vehicleName',
  PASSENGERS: 'passengers',
  LUGGAGE: 'luggage',
  FLIGHT_NUMBER: 'flightNumber',
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert euros to cents for Stripe
 * Stripe expects amounts in smallest currency unit (cents for EUR)
 * 
 * @param euros - Amount in euros
 * @returns Amount in cents (rounded)
 * 
 * @example
 * eurosToCents(42.50) // returns 4250
 * eurosToCents(42.99) // returns 4299
 */
export function eurosToCents(euros: number): number {
  return Math.round(euros * 100);
}

/**
 * Convert cents to euros for display
 * 
 * @param cents - Amount in cents
 * @returns Amount in euros
 * 
 * @example
 * centsToEuros(4250) // returns 42.50
 */
export function centsToEuros(cents: number): number {
  return cents / 100;
}

/**
 * Validate Stripe webhook signature
 * Use this in your webhook handler to verify requests are from Stripe
 * 
 * @param payload - Raw request body
 * @param signature - Stripe signature header
 * @returns Verified event or throws error
 * 
 * @throws Error if signature is invalid or webhook secret is not configured
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  if (!STRIPE_WEBHOOK_SECRET) {
    throw new Error(
      'STRIPE_WEBHOOK_SECRET is not configured. ' +
      'Please add it to your .env.local file to use webhooks.'
    );
  }

  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    throw new Error(
      `⚠️ Webhook signature verification failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

/**
 * Re-export commonly used Stripe types for convenience
 */
export type {
  Stripe as StripeType,
} from 'stripe';

export type StripeCheckoutSession = Stripe.Checkout.Session;
export type StripePaymentIntent = Stripe.PaymentIntent;
export type StripeCustomer = Stripe.Customer;
export type StripeEvent = Stripe.Event;

// ============================================================================
// DEVELOPMENT HELPERS
// ============================================================================

/**
 * Check if we're in test mode
 */
export const isTestMode = stripeSecretKey.startsWith('sk_test_');

/**
 * Log Stripe configuration on startup (development only)
 */
if (process.env.NODE_ENV === 'development') {
  console.log('🔐 Stripe Configuration:');
  console.log(`   Mode: ${isTestMode ? 'TEST' : 'LIVE'}`);
  console.log(`   Currency: ${STRIPE_CONFIG.currency.toUpperCase()}`);
  console.log(`   Webhook Secret: ${STRIPE_WEBHOOK_SECRET ? '✅ Configured' : '❌ Not configured'}`);
}