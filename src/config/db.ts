import mongoose from "mongoose";
import { logger } from "./logger";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    logger.info(`Connected to MongoDB ${mongoose.connection.host}`);
  } catch (error) {
    logger.error("Error connecting to MongoDB", error);
    process.exit(1);
  }
};

export default connectDB;
