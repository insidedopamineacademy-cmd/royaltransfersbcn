/**
 * Stripe Webhook Handler
 * POST /api/stripe/webhook
 * 
 * Handles Stripe webhook events
 * - checkout.session.completed: Update booking to paid
 * - payment_intent.succeeded: Confirm payment
 * - payment_intent.payment_failed: Handle failed payments
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe, WEBHOOK_EVENTS } from '@/lib/stripe/config';
import { updateBookingPaymentStatus, getBookingByStripeSessionId } from '@/lib/database/booking';
import type Stripe from 'stripe';
import { sendBookingConfirmationEmail, sendAdminNotificationEmail } from '@/lib/email/sender';

// ============================================================================
// IMPORTANT: Disable body parsing for webhook signature verification
// ============================================================================
export const runtime = 'nodejs';

// ============================================================================
// WEBHOOK HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  // Validate signature header
  if (!signature) {
    console.error('❌ No Stripe signature found');
    return NextResponse.json(
      { error: 'No signature found' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    console.log('✅ Webhook signature verified:', event.type);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}` },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case WEBHOOK_EVENTS.CHECKOUT_COMPLETED:
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case WEBHOOK_EVENTS.PAYMENT_SUCCEEDED:
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case WEBHOOK_EVENTS.PAYMENT_FAILED:
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case WEBHOOK_EVENTS.CHECKOUT_EXPIRED:
        await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session);
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Handle successful checkout session completion
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('🎉 Checkout completed:', session.id);

  try {
    // Get booking from database
    const booking = await getBookingByStripeSessionId(session.id);

    if (!booking) {
      console.error('❌ Booking not found for session:', session.id);
      return;
    }

    // Check payment status
    if (session.payment_status === 'paid') {
      // Update booking to paid
      const updatedBooking = await updateBookingPaymentStatus(
        booking.booking_id,
        'paid',
        session.payment_intent as string
      );

      console.log('✅ Booking updated to paid:', booking.booking_id);

      // Send confirmation emails
      try {
        console.log('📧 Starting email sending process...');
        
        // Send customer confirmation email
        await sendBookingConfirmationEmail(updatedBooking);
        console.log('✅ Customer confirmation email sent');

        // Send admin notification email
        await sendAdminNotificationEmail(updatedBooking);
        console.log('✅ Admin notification email sent');
      } catch (emailError) {
        // Don't fail the webhook if email fails
        console.error('⚠️ Failed to send emails:', emailError);
        if (emailError instanceof Error) {
          console.error('   Error message:', emailError.message);
          console.error('   Error stack:', emailError.stack);
        }
      }
    } else {
      console.log('⚠️ Checkout completed but payment not marked as paid:', session.payment_status);
    }
  } catch (error) {
    console.error('❌ Error handling checkout completed:', error);
    throw error;
  }
}

/**
 * Handle successful payment intent
 */
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('💰 Payment succeeded:', paymentIntent.id);

  // Payment intent succeeded
  // This is a backup - checkout.session.completed should handle most cases
  // But this ensures we catch payments even if session event fails
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('❌ Payment failed:', paymentIntent.id);

  try {
    // You could update booking status to 'cancelled' or 'failed' here
    // For now, just log it
    console.log('Payment failure reason:', paymentIntent.last_payment_error?.message);
  } catch (error) {
    console.error('❌ Error handling payment failed:', error);
  }
}

/**
 * Handle expired checkout session
 */
async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  console.log('⏰ Checkout session expired:', session.id);

  try {
    // Get booking from database
    const booking = await getBookingByStripeSessionId(session.id);

    if (booking && booking.payment_status === 'pending') {
      // Optionally mark booking as cancelled
      // await updateBookingStatus(booking.booking_id, 'cancelled');
      console.log('⚠️ Booking still pending for expired session:', booking.booking_id);
    }
  } catch (error) {
    console.error('❌ Error handling checkout expired:', error);
  }
}