const path = require('path');
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

const getBrandName = () =>
  process.env.MAIL_FROM_NAME
  || process.env.BRAND_NAME
  || 'TIK TRADES';

const EMAIL_LOGO_CID = 'tiktrades-horizontal-logo';
const EMAIL_LOGO_PATH = path.resolve(
  __dirname,
  '../../../frontend/src/assets/logo/Horizontal Color/PDF/Vertical/White/JPG copy.jpg'
);

const getEmbeddedLogo = () => ({
  filename: 'tiktrades-horizontal-logo.jpg',
  path: EMAIL_LOGO_PATH,
  cid: EMAIL_LOGO_CID
});

const formatMoney = (value, currency = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(Number(value) || 0);

const formatAccountType = (value = '') => {
  const normalized = String(value || '').toLowerCase();
  if (normalized === 'real') return 'Real Account';
  if (normalized === 'demo') return 'Demo Account';
  return value || 'Trading Account';
};

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
  const appName = getBrandName();
  const fromEmail = process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@tiktrades.com';
  const helpEmail = process.env.CONTACT_RECEIVER_EMAIL || fromEmail;
  const { transporter, isTestTransport } = await getTransporter();

  const displayName = firstName || 'Trader';
  const safeDisplayName = escapeHtml(displayName);
  const safeAppName = escapeHtml(appName);
  const safeResetUrl = escapeHtml(resetUrl);
  const safeHelpEmail = escapeHtml(helpEmail);
  const subject = `${appName} Password Reset Request`;
  const text = [
    `Hello ${displayName},`,
    '',
    `We received a request to reset your ${appName} password.`,
    'Use the link below to choose a new password:',
    resetUrl,
    '',
    'This link expires in 1 hour.',
    'If you did not request this reset, you can ignore this email and your password will remain unchanged.',
    '',
    `Need help? Contact ${helpEmail}.`
  ].join('\n');

  const html = `
    <div style="margin:0; padding:32px 16px; background:#07111b; font-family:Arial,Helvetica,sans-serif; color:#dbe7f5;">
      <div style="max-width:640px; margin:0 auto; background:linear-gradient(180deg,#0d1723 0%,#09121c 100%); border:1px solid #1a2a3d; border-radius:20px; overflow:hidden; box-shadow:0 24px 80px rgba(0,0,0,0.35);">
        <div style="padding:28px 32px; background:radial-gradient(circle at top right, rgba(212,168,67,0.24), transparent 40%), linear-gradient(135deg,#101b29 0%,#0a131d 100%); border-bottom:1px solid #1a2a3d;">
          <div style="margin-bottom:18px;">
            <img src="cid:${EMAIL_LOGO_CID}" alt="${safeAppName}" style="display:block; width:220px; max-width:100%; height:auto;" />
          </div>
          <div style="display:inline-block; padding:7px 12px; border-radius:999px; background:rgba(212,168,67,0.14); color:#f2c96b; font-size:12px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase;">Security Notice</div>
          <h1 style="margin:18px 0 10px; font-size:30px; line-height:1.15; color:#f5efe2;">Reset your password</h1>
          <p style="margin:0; font-size:15px; line-height:1.7; color:#9eb2c8;">
            Hello ${safeDisplayName}, we received a request to reset your ${safeAppName} password.
          </p>
        </div>

        <div style="padding:32px;">
          <div style="margin-bottom:24px; padding:22px; border-radius:16px; background:#060d15; border:1px solid #162638;">
            <h2 style="margin:0 0 12px; font-size:18px; color:#f5efe2;">Choose a new password</h2>
            <div style="margin:0 0 14px; color:#c8d5e4; font-size:14px; line-height:1.7;">
              For your security, this reset link expires in <strong>1 hour</strong>.
            </div>
            <a href="${safeResetUrl}" style="display:inline-block; padding:13px 22px; background:linear-gradient(135deg,#d4a843,#f0c85a); color:#07111b; text-decoration:none; border-radius:10px; font-weight:700;">
              Reset Password
            </a>
          </div>

          <div style="display:grid; grid-template-columns:1fr; gap:12px; margin-bottom:24px;">
            <div style="padding:16px 18px; border-radius:14px; background:#0b1520; border:1px solid #152535;">
              <div style="font-size:12px; letter-spacing:0.08em; text-transform:uppercase; color:#7f95ab; margin-bottom:6px;">If you requested this</div>
              <div style="font-size:14px; color:#e7eef7;">Use the button above and create a strong new password you have not used before.</div>
            </div>
            <div style="padding:16px 18px; border-radius:14px; background:#0b1520; border:1px solid #152535;">
              <div style="font-size:12px; letter-spacing:0.08em; text-transform:uppercase; color:#7f95ab; margin-bottom:6px;">If you did not request this</div>
              <div style="font-size:14px; color:#e7eef7;">You can safely ignore this email. Your current password will stay unchanged.</div>
            </div>
          </div>

          <div style="padding:18px; border-radius:14px; background:rgba(91,164,230,0.08); border:1px solid rgba(91,164,230,0.18); margin-bottom:20px;">
            <div style="font-size:13px; color:#c8d5e4; line-height:1.7; word-break:break-word;">
              If the button does not work, copy and paste this link into your browser:
              <div style="margin-top:10px;">
                <a href="${safeResetUrl}" style="color:#f2c96b; text-decoration:none;">${safeResetUrl}</a>
              </div>
            </div>
          </div>

          <div style="padding:18px; border-radius:14px; background:rgba(212,168,67,0.08); border:1px solid rgba(212,168,67,0.18);">
            <div style="font-size:13px; color:#c8d5e4; line-height:1.7;">
              Need help securing your account? Contact
              <a href="mailto:${safeHelpEmail}" style="color:#f2c96b; text-decoration:none;"> ${safeHelpEmail}</a>.
            </div>
          </div>
        </div>

        <div style="padding:18px 32px 28px; border-top:1px solid #1a2a3d; color:#70879c; font-size:12px; line-height:1.7;">
          This email was sent because someone requested a password reset for this address on ${safeAppName}.
        </div>
      </div>
    </div>
  `;

  const info = await transporter.sendMail({
    from: `"${appName}" <${fromEmail}>`,
    to,
    subject,
    text,
    html,
    attachments: [getEmbeddedLogo()]
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
  accountTypeLabel = 'trading account',
  accounts = [],
  createdAt = new Date().toISOString()
}) => {
  const appName = getBrandName();
  const fromEmail = process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@tiktrades.com';
  const clientUrl = (loginUrl || process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
  const resolvedLoginUrl = `${clientUrl}/login`;
  const fundingUrl = `${clientUrl}/deposits-withdrawals`;
  const marketsUrl = `${clientUrl}/markets`;
  const helpEmail = supportEmail || process.env.CONTACT_RECEIVER_EMAIL || fromEmail;
  const { transporter, isTestTransport } = await getTransporter();

  const fullName = `${firstName || ''} ${lastName || ''}`.trim();
  const safeDisplayName = escapeHtml(fullName || firstName || 'Trader');
  const safeAccountTypeLabel = escapeHtml(accountTypeLabel);
  const safeAppName = escapeHtml(appName);
  const safeHelpEmail = escapeHtml(helpEmail);
  const safeLoginUrl = escapeHtml(resolvedLoginUrl);
  const safeFundingUrl = escapeHtml(fundingUrl);
  const safeMarketsUrl = escapeHtml(marketsUrl);
  const joinedOn = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  const normalizedAccounts = Array.isArray(accounts) ? accounts : [];
  const realAccount = normalizedAccounts.find((account) => String(account.account_type || account.accountType).toLowerCase() === 'real');
  const demoAccount = normalizedAccounts.find((account) => String(account.account_type || account.accountType).toLowerCase() === 'demo');
  const primaryCurrency = realAccount?.currency || demoAccount?.currency || 'USD';
  const leverage = realAccount?.leverage || demoAccount?.leverage || 50;
  const totalBalance = normalizedAccounts.reduce((sum, account) => sum + (Number(account.balance) || 0), 0);
  const renderAccountRow = (account) => {
    if (!account) {
      return `
        <div style="padding:16px 18px; border-radius:14px; background:#0b1520; border:1px solid #152535;">
          <div style="font-size:12px; letter-spacing:0.08em; text-transform:uppercase; color:#7f95ab; margin-bottom:6px;">Account</div>
          <div style="font-size:14px; color:#e7eef7;">Pending setup</div>
        </div>
      `;
    }

    const typeLabel = escapeHtml(formatAccountType(account.account_type || account.accountType));
    const numberLabel = escapeHtml(account.account_number || account.accountNumber || 'Pending');
    const balanceLabel = escapeHtml(formatMoney(account.balance, account.currency || primaryCurrency));
    const statusLabel = escapeHtml(String(account.status || 'active').toUpperCase());
    const leverageLabel = escapeHtml(`1:${account.leverage || leverage}`);
    const currencyLabel = escapeHtml(account.currency || primaryCurrency);

    return `
      <div style="padding:16px 18px; border-radius:14px; background:#0b1520; border:1px solid #152535;">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; margin-bottom:10px;">
          <div style="font-size:12px; letter-spacing:0.08em; text-transform:uppercase; color:#7f95ab;">${typeLabel}</div>
          <div style="padding:4px 9px; border-radius:999px; background:rgba(61,214,140,0.12); color:#3dd68c; font-size:10px; font-weight:700; letter-spacing:0.08em;">${statusLabel}</div>
        </div>
        <div style="font-size:16px; color:#f5efe2; font-weight:700; margin-bottom:4px;">${numberLabel}</div>
        <div style="font-size:13px; color:#9eb2c8; line-height:1.7;">Balance: ${balanceLabel} · Leverage: ${leverageLabel} · Currency: ${currencyLabel}</div>
      </div>
    `;
  };

  const subject = `Welcome to ${appName}`;
  const text = [
    `Hello ${fullName || 'Trader'},`,
    '',
    `Welcome to ${appName}. Your ${accountTypeLabel} is ready.`,
    '',
    `Joined on: ${joinedOn}`,
    `Default leverage: 1:${leverage}`,
    `Current total balance: ${formatMoney(totalBalance, primaryCurrency)}`,
    '',
    realAccount ? `Real account: ${realAccount.account_number || realAccount.accountNumber || 'Pending'} (${formatMoney(realAccount.balance, realAccount.currency || primaryCurrency)})` : null,
    demoAccount ? `Demo account: ${demoAccount.account_number || demoAccount.accountNumber || 'Pending'} (${formatMoney(demoAccount.balance, demoAccount.currency || primaryCurrency)})` : null,
    '',
    'You can sign in here:',
    resolvedLoginUrl,
    '',
    'What you can do next:',
    '- Sign in to your dashboard',
    '- Complete your profile and KYC',
    '- Review available markets and funding options',
    `- Explore markets: ${marketsUrl}`,
    `- Funding and withdrawals: ${fundingUrl}`,
    '',
    `Need help? Contact us at ${helpEmail}.`,
    '',
    `Thank you for choosing ${appName}.`
  ].filter(Boolean).join('\n');

  const html = `
    <div style="margin:0; padding:32px 16px; background:#07111b; font-family:Arial,Helvetica,sans-serif; color:#dbe7f5;">
      <div style="max-width:640px; margin:0 auto; background:linear-gradient(180deg,#0d1723 0%,#09121c 100%); border:1px solid #1a2a3d; border-radius:20px; overflow:hidden; box-shadow:0 24px 80px rgba(0,0,0,0.35);">
        <div style="padding:28px 32px; background:radial-gradient(circle at top right, rgba(212,168,67,0.24), transparent 40%), linear-gradient(135deg,#101b29 0%,#0a131d 100%); border-bottom:1px solid #1a2a3d;">
          <div style="margin-bottom:18px;">
            <img src="cid:${EMAIL_LOGO_CID}" alt="${safeAppName}" style="display:block; width:220px; max-width:100%; height:auto;" />
          </div>
          <div style="display:inline-block; padding:7px 12px; border-radius:999px; background:rgba(212,168,67,0.14); color:#f2c96b; font-size:12px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase;">Welcome to ${safeAppName}</div>
          <h1 style="margin:18px 0 10px; font-size:30px; line-height:1.15; color:#f5efe2;">Your journey starts here</h1>
          <p style="margin:0; font-size:15px; line-height:1.7; color:#9eb2c8;">
            Hello ${safeDisplayName}, your ${safeAccountTypeLabel} has been created successfully.
          </p>
        </div>

        <div style="padding:32px;">
          <div style="display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:12px; margin-bottom:24px;">
            <div style="padding:16px 18px; border-radius:14px; background:#060d15; border:1px solid #162638;">
              <div style="font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:#7f95ab; margin-bottom:8px;">Joined</div>
              <div style="font-size:16px; font-weight:700; color:#f5efe2;">${escapeHtml(joinedOn)}</div>
            </div>
            <div style="padding:16px 18px; border-radius:14px; background:#060d15; border:1px solid #162638;">
              <div style="font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:#7f95ab; margin-bottom:8px;">Leverage</div>
              <div style="font-size:16px; font-weight:700; color:#f5efe2;">1:${escapeHtml(String(leverage))}</div>
            </div>
            <div style="padding:16px 18px; border-radius:14px; background:#060d15; border:1px solid #162638;">
              <div style="font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:#7f95ab; margin-bottom:8px;">Total Balance</div>
              <div style="font-size:16px; font-weight:700; color:#f5efe2;">${escapeHtml(formatMoney(totalBalance, primaryCurrency))}</div>
            </div>
          </div>

          <div style="margin-bottom:24px;">
            <h2 style="margin:0 0 12px; font-size:18px; color:#f5efe2;">Your account details</h2>
            <div style="display:grid; grid-template-columns:1fr; gap:12px;">
              ${renderAccountRow(realAccount)}
              ${renderAccountRow(demoAccount)}
            </div>
          </div>

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

          <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:24px;">
            <a href="${safeMarketsUrl}" style="display:inline-block; padding:11px 16px; border:1px solid #22354b; color:#dbe7f5; text-decoration:none; border-radius:10px; font-size:13px; font-weight:600;">Explore Markets</a>
            <a href="${safeFundingUrl}" style="display:inline-block; padding:11px 16px; border:1px solid #22354b; color:#dbe7f5; text-decoration:none; border-radius:10px; font-size:13px; font-weight:600;">Funding Options</a>
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
    html,
    attachments: [getEmbeddedLogo()]
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
  const appName = getBrandName();
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
    <div style="margin:0; padding:32px 16px; background:#07111b; font-family:Arial,Helvetica,sans-serif; color:#dbe7f5;">
      <div style="max-width:640px; margin:0 auto; background:linear-gradient(180deg,#0d1723 0%,#09121c 100%); border:1px solid #1a2a3d; border-radius:20px; overflow:hidden; box-shadow:0 24px 80px rgba(0,0,0,0.35);">
        <div style="padding:28px 32px; background:radial-gradient(circle at top right, rgba(212,168,67,0.24), transparent 40%), linear-gradient(135deg,#101b29 0%,#0a131d 100%); border-bottom:1px solid #1a2a3d;">
          <div style="margin-bottom:18px;">
            <img src="cid:${EMAIL_LOGO_CID}" alt="${escapeHtml(appName)}" style="display:block; width:220px; max-width:100%; height:auto;" />
          </div>
          <div style="display:inline-block; padding:7px 12px; border-radius:999px; background:rgba(212,168,67,0.14); color:#f2c96b; font-size:12px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase;">Contact Form</div>
          <h2 style="margin:18px 0 8px; color:#f5efe2; font-size:28px;">New contact submission</h2>
          <p style="margin:0; color:#9eb2c8; font-size:14px; line-height:1.7;">A new website enquiry was submitted through TIK TRADES.</p>
        </div>
        <div style="padding:32px;">
          <div style="display:grid; grid-template-columns:1fr; gap:12px; margin-bottom:24px;">
            <div style="padding:16px 18px; border-radius:14px; background:#0b1520; border:1px solid #152535;"><div style="font-size:12px; color:#7f95ab; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:6px;">Name</div><div style="font-size:14px; color:#e7eef7;">${fullName || 'N/A'}</div></div>
            <div style="padding:16px 18px; border-radius:14px; background:#0b1520; border:1px solid #152535;"><div style="font-size:12px; color:#7f95ab; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:6px;">Email</div><div style="font-size:14px; color:#e7eef7;">${email || 'N/A'}</div></div>
            <div style="padding:16px 18px; border-radius:14px; background:#0b1520; border:1px solid #152535;"><div style="font-size:12px; color:#7f95ab; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:6px;">Subject</div><div style="font-size:14px; color:#e7eef7;">${safeSubject}</div></div>
            <div style="padding:16px 18px; border-radius:14px; background:#0b1520; border:1px solid #152535;"><div style="font-size:12px; color:#7f95ab; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:6px;">Submitted At</div><div style="font-size:14px; color:#e7eef7;">${submittedAt}</div></div>
          </div>
          <div style="padding:18px; border-radius:14px; background:#060d15; border:1px solid #162638;">
            <div style="font-size:12px; color:#7f95ab; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:10px;">Message</div>
            <pre style="white-space:pre-wrap; margin:0; font-family:Arial,Helvetica,sans-serif; font-size:14px; line-height:1.7; color:#e7eef7;">${safeMessage}</pre>
          </div>
        </div>
      </div>
    </div>
  `;

  const info = await transporter.sendMail({
    from: `"${appName}" <${fromEmail}>`,
    to: supportInbox,
    replyTo: email || undefined,
    subject: mailSubject,
    text,
    html,
    attachments: [getEmbeddedLogo()]
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
