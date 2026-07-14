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

const sendPasswordResetEmail = (to, name, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:4200'}/reset-password/${resetToken}`;
  return sendEmail({
    to,
    subject: 'Reset your Cambo Rent password',
    html: `
      <h2>Hi ${name},</h2>
      <p>We received a request to reset your Cambo Rent account password.</p>
      <p>Click the link below to reset it (valid for 1 hour):</p>
      <p><a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#005DAC;color:#fff;text-decoration:none;border-radius:6px;">Reset Password</a></p>
      <p>If you didn't request this, you can ignore this email.</p>
      <br/>
      <p>Cheers,<br/>Cambo Rent Team</p>
    `,
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

module.exports = { sendEmail, sendPasswordResetEmail, sendBookingConfirmationEmail };
