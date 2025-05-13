import { IUser } from "#src/types/common";
import { Document, Schema, model } from "mongoose";

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    avatar: { type: String, required: false },
    phone: { type: String, required: false },
  },
  { timestamps: true }
);

export default model<IUser>("User", userSchema);
