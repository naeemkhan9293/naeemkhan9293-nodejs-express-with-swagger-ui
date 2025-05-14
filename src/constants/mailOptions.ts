import { logger } from "#src/config/logger";
import serverConfig from "#src/config/serverConfig";
import { createTransport, Transporter } from "nodemailer";
import { MailOptions } from "nodemailer/lib/sendmail-transport";

const emailSender = serverConfig.EMAIL_SENDER;

/**
 * Generates mail options object for different email types.
 * @param type - The type of email ('otp', 'email_verification', etc.).
 * @param recipientEmail - The email address of the recipient.
 * @param data - An object containing data needed for the email content (e.g., otpCode, verificationLink).
 * @returns A MailOptions object or undefined if the type is not handled.
 */
const generateMailOptions = async (
  type: string,
  recipientEmail: string,
  data: any
): Promise<MailOptions> => {
  let mailOptions: MailOptions = {
    from: emailSender,
    to: recipientEmail,
    subject: "",
    text: "",
    html: "",
  };

  switch (type) {
    case "otp":
      mailOptions.from = `OTP VERIFICATION <${emailSender}>`;
      mailOptions.subject = "Your One-Time Password (OTP)";
      mailOptions.html = `<p>Your OTP is: <strong>${data.otpCode}</strong>.</p><p>It is valid for a short period.</p>`;
      break;

    case "email_verification":
      mailOptions.subject = "Verify Your Email Address";
      mailOptions.text = `Please verify your email address by clicking on this link: ${data.verificationLink}`;
      mailOptions.html = `<p>Please verify your email address by clicking on the link below:</p><p><a href="${data.verificationLink}">Verify Email Address</a></p>`;
      break;

    default:
      logger.warn(`Email type not handled: ${type}`);
      break;
  }

  return mailOptions;
};

export { generateMailOptions };
