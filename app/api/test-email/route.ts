/**
 * Test Email API Route
 * GET /api/test-email
 * 
 * Tests SMTP connection and sends a test email
 */

import { NextRequest, NextResponse } from 'next/server';
import { emailTransporter, EMAIL_CONFIG } from '@/lib/email/config';
import { enforceDebugRouteAccess } from '@/lib/security/debug-auth';

export async function GET(request: NextRequest) {
  const denied = enforceDebugRouteAccess(request);
  if (denied) return denied;

  try {
    // First, verify SMTP connection
    await emailTransporter.verify();
    
    console.log('✅ SMTP connection verified');

    // Send a test email
    const info = await emailTransporter.sendMail({
      from: `${EMAIL_CONFIG.from.name} <${EMAIL_CONFIG.from.email}>`,
      to: EMAIL_CONFIG.admin, // Send to admin email
      subject: 'Test Email from Royal Transfers BCN',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
            <h1 style="color: #1e40af;">🎉 SMTP Test Successful!</h1>
            <p>Your email configuration is working correctly.</p>
            <p><strong>From:</strong> ${EMAIL_CONFIG.from.email}</p>
            <p><strong>To:</strong> ${EMAIL_CONFIG.admin}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #666; font-size: 14px;">
              This is a test email from your Royal Transfers BCN booking system.
              If you received this, your SMTP settings are configured correctly!
            </p>
          </div>
        </div>
      `,
      text: `
        SMTP Test Successful!
        
        Your email configuration is working correctly.
        From: ${EMAIL_CONFIG.from.email}
        To: ${EMAIL_CONFIG.admin}
        Time: ${new Date().toLocaleString()}
      `,
    });

    console.log('✅ Test email sent:', info.messageId);

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully!',
      details: {
        messageId: info.messageId,
        from: EMAIL_CONFIG.from.email,
        to: EMAIL_CONFIG.admin,
        accepted: info.accepted,
        rejected: info.rejected,
      },
    });

  } catch (error) {
    console.error('❌ Email test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : null,
    }, { status: 500 });
  }
}
