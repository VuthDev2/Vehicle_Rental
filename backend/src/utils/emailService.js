const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT) || 587,
      secure: parseInt(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  const transport = getTransporter();

  if (!transport) {
    console.log(' Email not sent (no SMTP config). Would have sent:');
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    return { sent: false, reason: 'SMTP not configured' };
  }

  try {
    await transport.sendMail({
      from: process.env.EMAIL_FROM || `"Cambo Rent" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(` Email sent to ${to}`);
    return { sent: true };
  } catch (err) {
    console.error(` Failed to send email to ${to}:`, err.message);
    return { sent: false, reason: err.message };
  }
};

const getEmailTemplate = (title, name, bodyContent, otp = null) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8f9fa; color: #333333;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f9fa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden; max-width: 600px; width: 100%;">
          <!-- Header -->
          <tr>
            <td style="background-color: #0ea776; padding: 30px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px;">Cambo Rent</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin-top: 0; font-size: 20px; color: #1e293b;">Hi ${name},</h2>
              <div style="font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 24px;">
                ${bodyContent}
              </div>
              
              ${otp ? \`
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 24px; text-align: center; margin: 32px 0;">
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #166534; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Your Security Code</p>
                <p style="margin: 0; font-size: 40px; letter-spacing: 12px; font-weight: 800; color: #0ea776;">\${otp}</p>
              </div>
              \` : ''}
              
              <div style="font-size: 16px; line-height: 1.6; color: #475569;">
                <p style="margin: 0 0 8px 0;">If you didn't request this, you can safely ignore this email.</p>
                <p style="margin: 0;">Thanks,<br/><strong>The Cambo Rent Team</strong></p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 24px 40px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0;">© \${new Date().getFullYear()} Cambo Rent. All rights reserved.</p>
              <p style="margin: 0;">This is an automated message, please do not reply.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
\`;

const sendVerificationEmail = (to, name, code) => {
  return sendEmail({
    to,
    subject: 'Verify your Cambo Rent email address',
    html: getEmailTemplate(
      'Verify your Email',
      name,
      '<p style="margin: 0;">Welcome to Cambo Rent! Use the 6-digit security code below to verify your email address. For your security, this code will expire in 10 minutes.</p>',
      code
    ),
  });
};

const sendPasswordResetEmail = (to, name, otp) => {
  return sendEmail({
    to,
    subject: 'Reset your Cambo Rent password',
    html: getEmailTemplate(
      'Reset Password Request',
      name,
      '<p style="margin: 0;">We received a request to reset the password for your Cambo Rent account. Use the 6-digit security code below to securely set a new password. This code is valid for 15 minutes.</p>',
      otp
    ),
  });
};

const sendBookingConfirmationEmail = (to, name, booking) => {
  return sendEmail({
    to,
    subject: `Booking Confirmed – ${booking.vehicle?.name || 'Vehicle'}`,
    html: `
      <h2>Hi ${name},</h2>
      <p>Your booking has been <strong>confirmed</strong>!</p>
      <table style="border-collapse:collapse;width:100%;max-width:400px;">
        <tr><td style="padding:6px 0;color:#666;">Vehicle</td><td style="padding:6px 0;"><strong>${booking.vehicle?.name || 'N/A'}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#666;">Pickup</td><td style="padding:6px 0;"><strong>${new Date(booking.startDate).toLocaleDateString()}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#666;">Return</td><td style="padding:6px 0;"><strong>${new Date(booking.endDate).toLocaleDateString()}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#666;">Total</td><td style="padding:6px 0;"><strong>$${booking.totalPrice}</strong></td></tr>
      </table>
      <p>Thank you for choosing Cambo Rent!</p>
    `,
  });
};

module.exports = { sendEmail, sendVerificationEmail, sendPasswordResetEmail, sendBookingConfirmationEmail };
