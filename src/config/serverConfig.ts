const serverConfig = Object.freeze({
  port: process.env.PORT || 5000,
  refreshTokenSecret: "secret",
  accessTokenSecret: "secret",
  refreshTokenExpiration: "7d",
  accessTokenExpiration: "1d",
  emailSender: process.env.EMAIL_SENDER,
});

export default serverConfig;
