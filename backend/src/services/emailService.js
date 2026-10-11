const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const env = require('../config/env');

// Generate 6-digit cryptographic OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

// Create transporter
let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (!env.EMAIL.USER || !env.EMAIL.PASS) {
    console.error('[Email Service] EMAIL_USER / EMAIL_PASS missing in .env');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: env.EMAIL.HOST,
    port: env.EMAIL.PORT,
    secure: env.EMAIL.PORT === 465,
    auth: { user: env.EMAIL.USER, pass: env.EMAIL.PASS }
  });

  return transporter;
};

/**
 * Generate, hash, and deliver an OTP to the user
 */
const sendOTP = async (user, purpose = 'registration') => {
  const otpCode = generateOTP();
  const salt = await bcrypt.genSalt(8);
  const codeHash = await bcrypt.hash(otpCode, salt);

  // 10 minutes expiry
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  user.otp = {
    codeHash,
    expiresAt,
    attempts: 0,
    lastResentAt: new Date(),
    purpose
  };

  await user.save();

  const emailSubject =
    purpose === 'registration'
      ? 'Verify your AgriShare Account - OTP'
      : purpose === 'password_reset'
      ? 'Password Reset Request - AgriShare OTP'
      : 'AgriShare Security Verification Code';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #15803d; margin: 0; font-size: 24px;">🌾 AgriShare Platform</h2>
        <p style="color: #64748b; margin-top: 4px; font-size: 14px;">Intelligent Agricultural Resource Sharing</p>
      </div>
      <div style="padding: 20px; background: #f8fafc; border-radius: 8px; text-align: center;">
        <p style="font-size: 16px; color: #334155; margin-bottom: 12px;">Hello <strong>${user.name}</strong>,</p>
        <p style="font-size: 14px; color: #64748b; margin-bottom: 20px;">Your one-time verification code is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #166534; background: #dcfce7; padding: 12px 24px; border-radius: 8px; display: inline-block;">
          ${otpCode}
        </div>
        <p style="font-size: 13px; color: #94a3b8; margin-top: 16px;">This code expires in <strong>10 minutes</strong>. Do not share this OTP with anyone.</p>
      </div>
      <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 24px;">
        If you did not request this, please safely disregard this email.
      </p>
    </div>
  `;

  let emailSent = false;
  try {
    const activeTransporter = await getTransporter();
    if (!activeTransporter) throw new Error('SMTP not configured');

    const info = await activeTransporter.sendMail({
      from: `"AgriShare Platform" <${env.EMAIL.USER}>`,
      to: user.email,
      subject: emailSubject,
      html: htmlContent
    });
    emailSent = true;
    console.log(`[Email Service] OTP sent to ${user.email}. MessageId: ${info.messageId}`);
  } catch (error) {
    transporter = null; // force a fresh connection next time
    console.error(`[Email Service] SMTP FAILED for ${user.email}: ${error.code || ''} ${error.message}`);
  }

  if (!emailSent) {
    return {
      success: false,
      message: 'Could not send the OTP email. Please try again later.'
    };
  }

  return { success: true, message: 'OTP sent successfully to email.' };
};

/**
 * Run once at server start so SMTP problems show up immediately in the terminal
 */
const verifySMTP = async () => {
  const t = await getTransporter();
  if (!t) return;
  try {
    await t.verify();
    console.log(`[Email Service] SMTP login OK as ${env.EMAIL.USER} - OTP mails will be delivered.`);
  } catch (e) {
    transporter = null;
    console.error(`\n[Email Service] SMTP LOGIN FAILED -> ${e.code || ''} ${e.message}`);
    if (e.code === 'EAUTH') {
      console.error('  Fix: use a Gmail account with 2-Step Verification ON and a 16-character App Password in EMAIL_PASS (no spaces).');
    } else if (e.code === 'ETIMEDOUT' || e.code === 'ECONNECTION' || e.code === 'ESOCKET') {
      console.error('  Fix: network is blocking SMTP. Try mobile hotspot, or set EMAIL_PORT=465.');
    }
    console.error('');
  }
};

module.exports = {
  generateOTP,
  sendOTP,
  verifySMTP
};
