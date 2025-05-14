import dotenv from "dotenv";
dotenv.config();

const serverConfig = Object.freeze({
  port: process.env.PORT || 5000,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET as string,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET as string,
  refreshTokenExpiration: "7d",
  accessTokenExpiration: "1d",
  EMAIL_SENDER: process.env.EMAIL_SENDER as string,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
  GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN as string,
});

export default serverConfig;
