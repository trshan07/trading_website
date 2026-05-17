const nodemailer = require('nodemailer');

let cachedTransporter = null;
let cachedIsTestTransport = false;
let cachedTransportVerified = false;

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

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

const sendWelcomeEmail = async ({
  to,
  firstName = '',
  lastName = '',
  loginUrl,
  supportEmail,
  accountTypeLabel = 'trading account'
}) => {
  const appName = process.env.APP_NAME || 'TIK TRADES';
  const fromEmail = process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@tiktrades.com';
  const clientUrl = (loginUrl || process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
  const resolvedLoginUrl = `${clientUrl}/login`;
  const helpEmail = supportEmail || process.env.CONTACT_RECEIVER_EMAIL || fromEmail;
  const { transporter, isTestTransport } = await getTransporter();

  const fullName = `${firstName || ''} ${lastName || ''}`.trim();
  const safeDisplayName = escapeHtml(fullName || firstName || 'Trader');
  const safeAccountTypeLabel = escapeHtml(accountTypeLabel);
  const safeAppName = escapeHtml(appName);
  const safeHelpEmail = escapeHtml(helpEmail);
  const safeLoginUrl = escapeHtml(resolvedLoginUrl);

  const subject = `Welcome to ${appName}`;
  const text = [
    `Hello ${fullName || 'Trader'},`,
    '',
    `Welcome to ${appName}. Your ${accountTypeLabel} is ready.`,
    '',
    'You can sign in here:',
    resolvedLoginUrl,
    '',
    'What you can do next:',
    '- Sign in to your dashboard',
    '- Complete your profile and KYC',
    '- Review available markets and funding options',
    '',
    `Need help? Contact us at ${helpEmail}.`,
    '',
    `Thank you for choosing ${appName}.`
  ].join('\n');

  const html = `
    <div style="margin:0; padding:32px 16px; background:#07111b; font-family:Arial,Helvetica,sans-serif; color:#dbe7f5;">
      <div style="max-width:640px; margin:0 auto; background:linear-gradient(180deg,#0d1723 0%,#09121c 100%); border:1px solid #1a2a3d; border-radius:20px; overflow:hidden; box-shadow:0 24px 80px rgba(0,0,0,0.35);">
        <div style="padding:28px 32px; background:radial-gradient(circle at top right, rgba(212,168,67,0.24), transparent 40%), linear-gradient(135deg,#101b29 0%,#0a131d 100%); border-bottom:1px solid #1a2a3d;">
          <div style="display:inline-block; padding:7px 12px; border-radius:999px; background:rgba(212,168,67,0.14); color:#f2c96b; font-size:12px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase;">Welcome to ${safeAppName}</div>
          <h1 style="margin:18px 0 10px; font-size:30px; line-height:1.15; color:#f5efe2;">Your journey starts here</h1>
          <p style="margin:0; font-size:15px; line-height:1.7; color:#9eb2c8;">
            Hello ${safeDisplayName}, your ${safeAccountTypeLabel} has been created successfully.
          </p>
        </div>

        <div style="padding:32px;">
          <div style="margin-bottom:24px; padding:22px; border-radius:16px; background:#060d15; border:1px solid #162638;">
            <h2 style="margin:0 0 12px; font-size:18px; color:#f5efe2;">What you can do next</h2>
            <div style="margin:0 0 10px; color:#c8d5e4; font-size:14px; line-height:1.7;">Access your dashboard, complete verification, and explore funding and trading features built into your account.</div>
            <a href="${safeLoginUrl}" style="display:inline-block; margin-top:8px; padding:13px 22px; background:linear-gradient(135deg,#d4a843,#f0c85a); color:#07111b; text-decoration:none; border-radius:10px; font-weight:700;">
              Sign In to TIK TRADES
            </a>
          </div>

          <div style="display:grid; grid-template-columns:1fr; gap:12px; margin-bottom:24px;">
            <div style="padding:16px 18px; border-radius:14px; background:#0b1520; border:1px solid #152535;">
              <div style="font-size:12px; letter-spacing:0.08em; text-transform:uppercase; color:#7f95ab; margin-bottom:6px;">Step 1</div>
              <div style="font-size:14px; color:#e7eef7;">Sign in and review your account dashboard.</div>
            </div>
            <div style="padding:16px 18px; border-radius:14px; background:#0b1520; border:1px solid #152535;">
              <div style="font-size:12px; letter-spacing:0.08em; text-transform:uppercase; color:#7f95ab; margin-bottom:6px;">Step 2</div>
              <div style="font-size:14px; color:#e7eef7;">Complete your profile and KYC details to unlock a smoother experience.</div>
            </div>
            <div style="padding:16px 18px; border-radius:14px; background:#0b1520; border:1px solid #152535;">
              <div style="font-size:12px; letter-spacing:0.08em; text-transform:uppercase; color:#7f95ab; margin-bottom:6px;">Step 3</div>
              <div style="font-size:14px; color:#e7eef7;">Review funding options and prepare your trading setup.</div>
            </div>
          </div>

          <div style="padding:18px; border-radius:14px; background:rgba(91,164,230,0.08); border:1px solid rgba(91,164,230,0.18);">
            <div style="font-size:13px; color:#c8d5e4; line-height:1.7;">
              Need help getting started? Reach out to us anytime at
              <a href="mailto:${safeHelpEmail}" style="color:#f2c96b; text-decoration:none;"> ${safeHelpEmail}</a>.
            </div>
          </div>
        </div>

        <div style="padding:18px 32px 28px; border-top:1px solid #1a2a3d; color:#70879c; font-size:12px; line-height:1.7;">
          You are receiving this email because a new account was created with this address on ${safeAppName}. If this was not you, please contact support immediately.
        </div>
      </div>
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
    console.log(`[EmailService] Ethereal preview URL (welcome): ${previewUrl}`);
  }

  return {
    messageId: info.messageId,
    previewUrl,
    isTestTransport
  };
};

const verifyEmailTransport = async () => {
  const { transporter, isTestTransport } = await getTransporter();

  if (!cachedTransportVerified) {
    await transporter.verify();
    cachedTransportVerified = true;
  }

  return { isTestTransport };
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
  verifyEmailTransport,
  sendPasswordResetEmail,
  sendContactFormEmail,
  sendWelcomeEmail
};
