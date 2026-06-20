import nodemailer from "nodemailer";

const getClientUrl = () => (process.env.CLIENT_URL || "").split(",")[0].trim().replace(/\/+$/, "");

const createTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    disableFileAccess: true,
    disableUrlAccess: true
  });
};

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn(`Email skipped because SMTP is not configured: ${subject}`);
    return false;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
      disableFileAccess: true,
      disableUrlAccess: true
    });
    return true;
  } catch (error) {
    console.error(`Email delivery failed: ${error.message}`);
    return false;
  }
};

export const sendVerificationEmail = ({ user, token }) => {
  const verifyUrl = `${getClientUrl()}/verify-email?token=${encodeURIComponent(token)}`;
  return sendEmail({
    to: user.email,
    subject: "Verify your Ramixaq AI email",
    html: `<p>Hello ${user.name},</p><p>Verify your email to secure your Ramixaq AI account.</p><p><a href="${verifyUrl}">Verify email</a></p><p>This link expires in 24 hours.</p>`
  });
};

export const sendPasswordResetEmail = ({ user, token }) => {
  const resetUrl = `${getClientUrl()}/reset-password?token=${encodeURIComponent(token)}`;
  return sendEmail({
    to: user.email,
    subject: "Reset your Ramixaq AI password",
    html: `<p>Hello ${user.name},</p><p>A password reset was requested for your account.</p><p><a href="${resetUrl}">Reset password</a></p><p>This link expires in 60 minutes. Ignore this email if you did not request it.</p>`
  });
};
