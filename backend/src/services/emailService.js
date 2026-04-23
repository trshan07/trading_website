const nodemailer = require('nodemailer');

let cachedTransporter = null;
let cachedIsTestTransport = false;

const getTransporter = async () => {
  if (cachedTransporter) {
    return { transporter: cachedTransporter, isTestTransport: cachedIsTestTransport };
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpSecure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || smtpPort === 465;
  const hasAnySmtpConfig = Boolean(smtpHost || smtpUser || smtpPass);

  if (smtpHost && smtpUser && smtpPass) {
    cachedTransporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });
    cachedIsTestTransport = false;
    return { transporter: cachedTransporter, isTestTransport: cachedIsTestTransport };
  }

  // If user started configuring SMTP but left a required field empty, fail loudly.
  if (hasAnySmtpConfig) {
    throw new Error('SMTP configuration is incomplete. Please set SMTP_HOST, SMTP_USER and SMTP_PASS.');
  }

  if ((process.env.NODE_ENV || 'development') !== 'production') {
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    cachedIsTestTransport = true;
    return { transporter: cachedTransporter, isTestTransport: cachedIsTestTransport };
  }

  throw new Error('SMTP is not configured');
};

const sendPasswordResetEmail = async ({ to, resetUrl, firstName = '' }) => {
  const appName = process.env.APP_NAME || 'TIK TRADES';
  const fromEmail = process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@tiktrades.com';
  const { transporter, isTestTransport } = await getTransporter();

  const safeName = firstName ? ` ${firstName}` : '';
  const subject = `${appName} Password Reset Request`;
  const text = [
    `Hello${safeName},`,
    '',
    'We received a request to reset your password.',
    'Click the link below to choose a new password:',
    resetUrl,
    '',
    'This link expires in 1 hour. If you did not request this, you can ignore this email.'
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
      <h2 style="margin-bottom: 8px;">${appName} Password Reset</h2>
      <p>Hello${safeName},</p>
      <p>We received a request to reset your password.</p>
      <p>
        <a href="${resetUrl}" style="display:inline-block; padding:10px 16px; background:#d4af37; color:#111827; text-decoration:none; border-radius:6px; font-weight:700;">
          Reset Password
        </a>
      </p>
      <p>If the button does not work, copy and paste this link:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p style="margin-top: 16px;">This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
    </div>
  `;

  const info = await transporter.sendMail({
    from: `"${appName}" <${fromEmail}>`,
    to,
    subject,
    text,
    html
  });

  const previewUrl = nodemailer.getTestMessageUrl(info) || null;
  if (isTestTransport && previewUrl) {
    console.log(`[EmailService] Ethereal preview URL (password reset): ${previewUrl}`);
  }

  return {
    messageId: info.messageId,
    previewUrl,
    isTestTransport
  };
};

const sendContactFormEmail = async ({ fullName, email, subject = '', message = '' }) => {
  const appName = process.env.APP_NAME || 'TIK TRADES';
  const fromEmail = process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@tiktrades.com';
  const supportInbox = process.env.CONTACT_RECEIVER_EMAIL || 'dinushafdo9998@gmail.com';
  const { transporter, isTestTransport } = await getTransporter();

  const safeSubject = (subject || 'New Contact Form Message').trim();
  const mailSubject = `[${appName}] Contact Form: ${safeSubject}`;
  const submittedAt = new Date().toISOString();

  const text = [
    'New contact form submission received.',
    '',
    `Name: ${fullName || 'N/A'}`,
    `Email: ${email || 'N/A'}`,
    `Subject: ${safeSubject}`,
    `Submitted At: ${submittedAt}`,
    '',
    'Message:',
    message || '(empty)'
  ].join('\n');

  const safeMessage = (message || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
      <h2 style="margin-bottom: 8px;">New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${fullName || 'N/A'}</p>
      <p><strong>Email:</strong> ${email || 'N/A'}</p>
      <p><strong>Subject:</strong> ${safeSubject}</p>
      <p><strong>Submitted At:</strong> ${submittedAt}</p>
      <hr style="border:none; border-top:1px solid #e5e7eb; margin:16px 0;" />
      <p><strong>Message:</strong></p>
      <pre style="white-space: pre-wrap; font-family: inherit;">${safeMessage}</pre>
    </div>
  `;

  const info = await transporter.sendMail({
    from: `"${appName}" <${fromEmail}>`,
    to: supportInbox,
    replyTo: email || undefined,
    subject: mailSubject,
    text,
    html
  });

  const previewUrl = nodemailer.getTestMessageUrl(info) || null;
  if (isTestTransport && previewUrl) {
    console.log(`[EmailService] Ethereal preview URL (contact): ${previewUrl}`);
  }

  return {
    messageId: info.messageId,
    previewUrl,
    isTestTransport
  };
};

module.exports = {
  sendPasswordResetEmail,
  sendContactFormEmail
};
