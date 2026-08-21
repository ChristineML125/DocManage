import nodemailer from 'nodemailer';
import dns from 'dns';

function getTransportOptions() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error('Email is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.');
  }

  return {
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  };
}

// Some hosts (e.g. Render) have no IPv6 egress, so connecting to an AAAA
// address fails with ENETUNREACH. Resolve the SMTP host to an IPv4 address
// ourselves and keep the original hostname for TLS SNI/certificate checks.
async function forceIpv4(options) {
  try {
    const result = await dns.promises.lookup(options.host, { family: 4 });
    options.tls = { ...(options.tls || {}), servername: options.host };
    options.host = result.address;
  } catch (error) {
    console.warn(`IPv4 lookup for ${options.host} failed, using hostname as-is:`, error.message);
  }
  return options;
}

export async function sendTemporaryPasswordEmail({ email, userName, temporaryPassword }) {
  const options = await forceIpv4(getTransportOptions());
  const transporter = nodemailer.createTransport(options);
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to: email,
    subject: 'Your temporary password',
    text: `Hello ${userName},\n\nYour temporary password is: ${temporaryPassword}\n\nPlease sign in and change this password immediately in Account Settings.\n\nIf you did not request this, contact your administrator.`,
    html: `<p>Hello ${userName},</p><p>Your temporary password is:</p><p><strong>${temporaryPassword}</strong></p><p>Please sign in and change this password immediately in <strong>Account Settings</strong>.</p><p>If you did not request this, contact your administrator.</p>`
  });
}
