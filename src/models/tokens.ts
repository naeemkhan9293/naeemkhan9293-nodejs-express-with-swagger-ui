import { IToken } from "#src/types/common";
import mongoose, { Schema } from "mongoose";

const TokenSchema = new Schema<IToken>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
    index: true,
  },
  tokenHash: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["email_verification", "password_reset", "otp"],
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Token = mongoose.model<IToken>("Token", TokenSchema);

export default Token;
