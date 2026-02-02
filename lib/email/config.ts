/**
 * Email Configuration
 * SMTP setup using Nodemailer with MXRoute
 */

import nodemailer from 'nodemailer';

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================

const requiredEnvVars = {
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  EMAIL_FROM: process.env.EMAIL_FROM,
  EMAIL_ADMIN: process.env.EMAIL_ADMIN,
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('❌ Missing email environment variables:', missingVars.join(', '));
  console.error('Please add them to your .env.local file');
}

// ============================================================================
// SMTP TRANSPORTER
// ============================================================================

/**
 * Create Nodemailer transporter with MXRoute SMTP
 */
export const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  // Additional options for better compatibility
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates if needed
  },
});

// ============================================================================
// EMAIL CONFIGURATION
// ============================================================================

export const EMAIL_CONFIG = {
  from: {
    email: process.env.EMAIL_FROM || 'info@royaltransfersbcn.com',
    name: process.env.EMAIL_FROM_NAME || 'Royal Transfers BCN',
  },
  admin: process.env.EMAIL_ADMIN || 'admin@royaltransfersbcn.com',
  replyTo: process.env.EMAIL_FROM || 'info@royaltransfersbcn.com',
} as const;

// ============================================================================
// VERIFY CONNECTION (Development Only)
// ============================================================================

if (process.env.NODE_ENV === 'development') {
  emailTransporter.verify((error, success) => {
    if (error) {
      console.error('❌ SMTP Connection Error:', error.message);
      console.error('Please check your email configuration in .env.local');
    } else {
      console.log('✅ SMTP Server is ready to send emails');
      console.log(`   From: ${EMAIL_CONFIG.from.name} <${EMAIL_CONFIG.from.email}>`);
      console.log(`   Admin: ${EMAIL_CONFIG.admin}`);
    }
  });
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}