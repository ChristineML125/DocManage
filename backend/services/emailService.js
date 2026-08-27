const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

function buildTemporaryPasswordContent(userName, temporaryPassword) {
  return {
    subject: 'Your temporary password',
    text: `Hello ${userName},\n\nYour temporary password is: ${temporaryPassword}\n\nPlease sign in and change this password immediately in Account Settings.\n\nIf you did not request this, contact your administrator.`,
    html: `<p>Hello ${userName},</p><p>Your temporary password is:</p><p><strong>${temporaryPassword}</strong></p><p>Please sign in and change this password immediately in <strong>Account Settings</strong>.</p><p>If you did not request this, contact your administrator.</p>`
  };
}

export async function sendTemporaryPasswordEmail({ email, userName, temporaryPassword }) {
  const apiKey = process.env.BREVO_API_KEY;
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
  if (!apiKey || !from) {
    throw new Error('Email is not configured. Set BREVO_API_KEY and EMAIL_FROM.');
  }

  const { subject, text, html } = buildTemporaryPasswordContent(userName, temporaryPassword);

  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: { name: process.env.EMAIL_SENDER_NAME || 'Dovra', email: from },
      to: [{ email }],
      subject,
      textContent: text,
      htmlContent: html
    }),
    signal: AbortSignal.timeout(15000)
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      detail = JSON.stringify(await response.json());
    } catch {
      // keep statusText when the body is not JSON
    }
    throw new Error(`Email service error (${response.status}): ${detail}`);
  }
}
