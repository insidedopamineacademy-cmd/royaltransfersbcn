/**
 * Email Sending Utility
 * Functions to send booking confirmation and admin notification emails
 */

import { emailTransporter, EMAIL_CONFIG, type SendEmailOptions } from './config';
import type { DatabaseBooking } from '@/lib/database/booking';

// ============================================================================
// SEND EMAIL FUNCTION
// ============================================================================

/**
 * Send an email using the configured transporter
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    console.log('📧 Attempting to send email to:', options.to);
    console.log('📧 Subject:', options.subject);
    
    const info = await emailTransporter.sendMail({
      from: `${EMAIL_CONFIG.from.name} <${EMAIL_CONFIG.from.email}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo || EMAIL_CONFIG.replyTo,
    });

    console.log('✅ Email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('   Accepted:', info.accepted);
    console.log('   Rejected:', info.rejected);
    console.log('   Response:', info.response);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to send email!');
    console.error('   Error:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
    }
    return false;
  }
}

// ============================================================================
// BOOKING CONFIRMATION EMAIL (Customer)
// ============================================================================

/**
 * Send booking confirmation email to customer
 */
export async function sendBookingConfirmationEmail(
  booking: DatabaseBooking
): Promise<boolean> {
  const isCardPayment = booking.payment_method === 'card';
  const isPaid = booking.payment_status === 'paid';

  const subject = `Booking Confirmed - ${booking.booking_id}`;
  
  const html = generateBookingConfirmationHTML(booking, isCardPayment, isPaid);
  const text = generateBookingConfirmationText(booking, isCardPayment, isPaid);

  return sendEmail({
    to: booking.customer_email,
    subject,
    html,
    text,
  });
}

// ============================================================================
// ADMIN NOTIFICATION EMAIL
// ============================================================================

/**
 * Send new booking notification to admin
 */
export async function sendAdminNotificationEmail(
  booking: DatabaseBooking
): Promise<boolean> {
  const subject = `New Booking: ${booking.booking_id} - ${booking.payment_method.toUpperCase()}`;
  
  const html = generateAdminNotificationHTML(booking);
  const text = generateAdminNotificationText(booking);

  return sendEmail({
    to: EMAIL_CONFIG.admin,
    subject,
    html,
    text,
  });
}

// ============================================================================
// HTML EMAIL TEMPLATES
// ============================================================================

/**
 * Generate HTML for customer booking confirmation email
 */
function generateBookingConfirmationHTML(
  booking: DatabaseBooking,
  isCardPayment: boolean,
  isPaid: boolean
): string {
  const paymentStatusBadge = isPaid 
    ? '<span style="background-color: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600;">PAID</span>'
    : '<span style="background-color: #f59e0b; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600;">PENDING</span>';

  const paymentInstructions = isCardPayment
    ? `<p style="color: #059669; font-weight: 600; margin: 0;">✓ Payment received via card</p>`
    : `
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-top: 10px;">
        <p style="color: #92400e; font-weight: 600; margin: 0 0 8px 0;">⚠️ Pay Driver in Cash</p>
        <p style="color: #78350f; margin: 0; font-size: 14px;">Please have €${Number(booking.total_price).toFixed(2)} ready for the driver. Having the exact amount is appreciated.</p>
      </div>
    `;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1e40af 0%, #06b6d4 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 28px;">✓ Booking Confirmed!</h1>
      <p style="color: #e0f2fe; margin: 10px 0 0 0; font-size: 16px;">Your transfer is confirmed</p>
    </div>

    <!-- Main Content -->
    <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      
      <!-- Booking Reference -->
      <div style="text-align: center; margin-bottom: 30px;">
        <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px;">Booking Reference</p>
        <p style="color: #1e40af; font-size: 24px; font-weight: bold; margin: 0; font-family: monospace;">${booking.booking_id}</p>
      </div>

      <!-- Transfer Details -->
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
        <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Transfer Details</h2>
        
        <div style="margin-bottom: 12px;">
          <p style="color: #6b7280; margin: 0 0 4px 0; font-size: 13px;">📍 Pickup</p>
          <p style="color: #111827; margin: 0; font-weight: 600;">${booking.pickup_address}</p>
        </div>

        <div style="margin-bottom: 12px;">
          <p style="color: #6b7280; margin: 0 0 4px 0; font-size: 13px;">📍 Dropoff</p>
          <p style="color: #111827; margin: 0; font-weight: 600;">${booking.dropoff_address}</p>
        </div>

        <div style="margin-bottom: 12px;">
          <p style="color: #6b7280; margin: 0 0 4px 0; font-size: 13px;">📅 Date & Time</p>
          <p style="color: #111827; margin: 0; font-weight: 600;">${booking.pickup_date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${booking.pickup_time}</p>
        </div>

        <div style="margin-bottom: 12px;">
          <p style="color: #6b7280; margin: 0 0 4px 0; font-size: 13px;">🚗 Vehicle</p>
          <p style="color: #111827; margin: 0; font-weight: 600;">${booking.vehicle_name}</p>
        </div>

        <div>
          <p style="color: #6b7280; margin: 0 0 4px 0; font-size: 13px;">👥 Passengers & Luggage</p>
          <p style="color: #111827; margin: 0; font-weight: 600;">${booking.passengers_count} passengers, ${booking.luggage_count} luggage</p>
        </div>

        ${booking.flight_number ? `
        <div style="margin-top: 12px;">
          <p style="color: #6b7280; margin: 0 0 4px 0; font-size: 13px;">✈️ Flight Number</p>
          <p style="color: #111827; margin: 0; font-weight: 600;">${booking.flight_number}</p>
        </div>
        ` : ''}
      </div>

      <!-- Payment Details -->
      <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
        <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Payment Details</h2>
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <span style="color: #6b7280;">Payment Method</span>
          <span style="color: #111827; font-weight: 600;">${isCardPayment ? 'Credit Card' : 'Cash'}</span>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <span style="color: #6b7280;">Status</span>
          ${paymentStatusBadge}
        </div>

        <div style="border-top: 2px solid #1e40af; padding-top: 15px; margin-top: 15px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #1f2937; font-size: 18px; font-weight: bold;">Total</span>
            <span style="color: #1e40af; font-size: 24px; font-weight: bold;">€${Number(booking.total_price).toFixed(2)}</span>
          </div>
        </div>

        ${paymentInstructions}
      </div>

      <!-- What's Next -->
      <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
        <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">📋 What's Next?</h2>
        
        <div style="margin-bottom: 15px;">
          <p style="margin: 0 0 8px 0; color: #1e40af; font-weight: 600;">1. Check Your Email</p>
          <p style="margin: 0; color: #374151; font-size: 14px;">Keep this confirmation safe for your records</p>
        </div>

        <div style="margin-bottom: 15px;">
          <p style="margin: 0 0 8px 0; color: #1e40af; font-weight: 600;">2. Driver Assignment</p>
          <p style="margin: 0; color: #374151; font-size: 14px;">24h before pickup, you'll receive driver contact information</p>
        </div>

        <div>
          <p style="margin: 0 0 8px 0; color: #1e40af; font-weight: 600;">3. Enjoy Your Ride</p>
          <p style="margin: 0; color: #374151; font-size: 14px;">Your driver will meet you at the pickup location</p>
        </div>
      </div>

      <!-- Contact Info -->
      <div style="text-align: center; padding: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">Need help with your booking?</p>
        <p style="margin: 0;">
          <a href="mailto:${EMAIL_CONFIG.from.email}" style="color: #1e40af; text-decoration: none; font-weight: 600;">${EMAIL_CONFIG.from.email}</a>
        </p>
      </div>

    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        Royal Transfers BCN | Premium Transfer Services in Barcelona
      </p>
    </div>

  </div>
</body>
</html>
  `;
}

/**
 * Generate plain text version for customer confirmation
 */
function generateBookingConfirmationText(
  booking: DatabaseBooking,
  isCardPayment: boolean,
  isPaid: boolean
): string {
  const paymentStatus = isPaid ? 'PAID' : 'PENDING';
  const paymentInstructions = isCardPayment
    ? 'Payment received via credit card.'
    : `IMPORTANT: Please pay €${Number(booking.total_price).toFixed(2)} to the driver in cash. Having the exact amount is appreciated.`;

  return `
BOOKING CONFIRMED!

Booking Reference: ${booking.booking_id}

TRANSFER DETAILS
================
Pickup: ${booking.pickup_address}
Dropoff: ${booking.dropoff_address}
Date & Time: ${booking.pickup_date.toLocaleDateString()} at ${booking.pickup_time}
Vehicle: ${booking.vehicle_name}
Passengers: ${booking.passengers_count}
Luggage: ${booking.luggage_count}
${booking.flight_number ? `Flight: ${booking.flight_number}` : ''}

PAYMENT DETAILS
===============
Payment Method: ${isCardPayment ? 'Credit Card' : 'Cash'}
Status: ${paymentStatus}
Total: €${Number(booking.total_price).toFixed(2)}

${paymentInstructions}

WHAT'S NEXT?
============
1. Check Your Email - Keep this confirmation safe
2. Driver Assignment - 24h before pickup, you'll receive driver contact
3. Enjoy Your Ride - Driver will meet you at pickup location

Need help? Contact us at ${EMAIL_CONFIG.from.email}

Royal Transfers BCN
Premium Transfer Services in Barcelona
  `;
}

/**
 * Generate HTML for admin notification email
 */
function generateAdminNotificationHTML(booking: DatabaseBooking): string {
  const paymentMethodBadge = booking.payment_method === 'card'
    ? '<span style="background-color: #3b82f6; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">CARD</span>'
    : '<span style="background-color: #10b981; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">CASH</span>';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Booking</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <div style="background-color: #1f2937; padding: 20px; border-radius: 8px 8px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 20px;">🔔 New Booking Received</h1>
    </div>

    <div style="background-color: white; padding: 25px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      
      <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb;">
        <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 13px;">Booking ID</p>
        <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1f2937; font-family: monospace;">${booking.booking_id}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">Payment Method:</td>
          <td style="padding: 8px 0;">${paymentMethodBadge}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Total Amount:</td>
          <td style="padding: 8px 0; font-weight: 600; color: #1f2937;">€${Number(booking.total_price).toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Customer:</td>
          <td style="padding: 8px 0; font-weight: 600; color: #1f2937;">${booking.customer_first_name} ${booking.customer_last_name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Email:</td>
          <td style="padding: 8px 0;"><a href="mailto:${booking.customer_email}" style="color: #1e40af; text-decoration: none;">${booking.customer_email}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Phone:</td>
          <td style="padding: 8px 0;"><a href="tel:${booking.customer_country_code}${booking.customer_phone}" style="color: #1e40af; text-decoration: none;">${booking.customer_country_code} ${booking.customer_phone}</a></td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 15px 0 8px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">
            <strong>Transfer Details:</strong>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Pickup:</td>
          <td style="padding: 8px 0; color: #1f2937;">${booking.pickup_address}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Dropoff:</td>
          <td style="padding: 8px 0; color: #1f2937;">${booking.dropoff_address}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Date & Time:</td>
          <td style="padding: 8px 0; font-weight: 600; color: #1f2937;">${booking.pickup_date.toLocaleDateString()} at ${booking.pickup_time}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Vehicle:</td>
          <td style="padding: 8px 0; color: #1f2937;">${booking.vehicle_name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Passengers:</td>
          <td style="padding: 8px 0; color: #1f2937;">${booking.passengers_count} passengers, ${booking.luggage_count} luggage</td>
        </tr>
        ${booking.flight_number ? `
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Flight:</td>
          <td style="padding: 8px 0; color: #1f2937;">${booking.flight_number}</td>
        </tr>
        ` : ''}
      </table>

      ${booking.special_requests ? `
      <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
        <p style="margin: 0 0 5px 0; color: #92400e; font-weight: 600; font-size: 13px;">Special Requests:</p>
        <p style="margin: 0; color: #78350f; font-size: 14px;">${booking.special_requests}</p>
      </div>
      ` : ''}

    </div>

    <div style="text-align: center; padding: 15px; color: #9ca3af; font-size: 12px;">
      Royal Transfers BCN Admin Notification
    </div>

  </div>
</body>
</html>
  `;
}

/**
 * Generate plain text for admin notification
 */
function generateAdminNotificationText(booking: DatabaseBooking): string {
  return `
NEW BOOKING RECEIVED

Booking ID: ${booking.booking_id}
Payment Method: ${booking.payment_method.toUpperCase()}
Total Amount: €${Number(booking.total_price).toFixed(2)}

CUSTOMER INFO
=============
Name: ${booking.customer_first_name} ${booking.customer_last_name}
Email: ${booking.customer_email}
Phone: ${booking.customer_country_code} ${booking.customer_phone}

TRANSFER DETAILS
================
Pickup: ${booking.pickup_address}
Dropoff: ${booking.dropoff_address}
Date & Time: ${booking.pickup_date.toLocaleDateString()} at ${booking.pickup_time}
Vehicle: ${booking.vehicle_name}
Passengers: ${booking.passengers_count}
Luggage: ${booking.luggage_count}
${booking.flight_number ? `Flight: ${booking.flight_number}` : ''}

${booking.special_requests ? `SPECIAL REQUESTS:\n${booking.special_requests}` : ''}

---
Royal Transfers BCN
  `;
}