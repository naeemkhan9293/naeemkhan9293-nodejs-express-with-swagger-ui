import { IUser } from "#src/types/common";
import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import serverConfig from "#src/config/serverConfig";

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: { type: String, required: true },
    avatar: { type: String, required: false },
    phone: { type: String, required: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (this: IUser, next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.methods.comparePassword = async function (this: IUser, password: string) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function (this: IUser) {
  return jwt.sign({ id: this._id }, serverConfig.accessTokenSecret, {
    expiresIn: serverConfig.accessTokenExpiration,
  });
};

userSchema.methods.generateRefreshToken = async function (this: IUser) {
  return jwt.sign({ id: this._id }, serverConfig.refreshTokenSecret, {
    expiresIn: serverConfig.refreshTokenExpiration,
  });
};

export default model<IUser>("User", userSchema);
