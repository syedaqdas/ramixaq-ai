import nodemailer from "nodemailer";

const getClientUrl = () => (process.env.CLIENT_URL || "").split(",")[0].trim().replace(/\/+$/, "");

const createTransporter = () => {
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  const host = process.env.SMTP_HOST || (process.env.EMAIL_USER ? "smtp.gmail.com" : "");

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
    auth: {
      user,
      pass
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
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || process.env.SMTP_USER,
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

export const sendOtpEmail = ({ user, otp }) =>
  sendEmail({
    to: user.email,
    subject: "Your Ramixaq AI login code",
    html: `<p>Hello ${user.name},</p><p>Your Ramixaq AI login code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${otp}</p><p>This code expires in 10 minutes. Do not share it with anyone.</p>`
  });
