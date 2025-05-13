import { createTransport } from "nodemailer";

// WARNING: Hardcoding credentials like clientId, clientSecret, and refreshToken
// directly in your code is highly insecure and NOT recommended for production.
// These should be stored securely, for example, in environment variables or a secrets manager.
// This example uses hardcoded values as per your request for demonstration.

const transporter = createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: "realemail@gmail.com",
    clientId: "",
    clientSecret: "",
    refreshToken: "",
  },
});

// 1. Verify the transporter configuration
async function verifyTransporter() {
  console.log("Verifying transporter configuration...");
  try {
    const success = await transporter.verify();
    if (success) {
      console.log("Server is ready to take our messages (OAuth2 authentication successful).");
      return true;
    } else {
      // This else case might not be hit if verify throws an error on failure
      console.log("Server verification failed, but no explicit error thrown.");
      return false;
    }
  } catch (error) {
    console.error("Error during transporter verification:", error);
    return false;
  }
}

// 2. Send an email
async function sendTestEmail() {
  console.log("\nAttempting to send a test email...");
  try {
    const mailOptions = {
      from: '"Your App Name" <realmeila@gmail.com>', // Sender address (must match the 'user' in auth)
      to: "saudkhanbpk@gmail.com", // Change to a valid recipient email address for testing
      subject: "Nodemailer OAuth2 Test Email",
      text: "Hello! This is a test email sent using Nodemailer with Gmail OAuth2.",
      html: "<b>Hello!</b><p>This is a test email sent using Nodemailer with Gmail OAuth2.</p>",
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
    console.log("Message ID:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    // Common OAuth2 errors here could be:
    // - Token invalid or expired (you might need to refresh or re-authorize)
    // - Incorrect scopes for the token (needs gmail.send scope)
    // - Gmail API not enabled in your Google Cloud project
    // - User (me@gmail.com) mismatch with token
  }
}

// Run the functions
async function main() {
  const isVerified = await verifyTransporter();
  if (isVerified) {
    await sendTestEmail();
  } else {
    console.log("\nTransporter verification failed. Email sending will not be attempted.");
    console.log(
      "Please check your OAuth2 credentials, ensure the Gmail API is enabled in your Google Cloud project,"
    );
    console.log(
      "and that your refresh token is valid and has the necessary permissions (e.g., 'gmail.send' scope)."
    );
  }
}

main();
