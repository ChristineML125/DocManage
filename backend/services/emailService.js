import nodemailer from 'nodemailer';

function getTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error('Email is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.');
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
}

export async function sendTemporaryPasswordEmail({ email, userName, temporaryPassword }) {
  const transporter = getTransport();
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to: email,
    subject: 'Your temporary password',
    text: `Hello ${userName},\n\nYour temporary password is: ${temporaryPassword}\n\nPlease sign in and change this password immediately in Account Settings.\n\nIf you did not request this, contact your administrator.`,
    html: `<p>Hello ${userName},</p><p>Your temporary password is:</p><p><strong>${temporaryPassword}</strong></p><p>Please sign in and change this password immediately in <strong>Account Settings</strong>.</p><p>If you did not request this, contact your administrator.</p>`
  });
}
