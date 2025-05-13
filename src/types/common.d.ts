import { Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: "customer" | "seller" | "admin" | "superadmin" | string;
  avatar: string;
  phone: string;
  verified: boolean;
  refreshToken: string;
  comparePassword(password: string): Promise<boolean>;
  generateAccessToken(): Promise<string>;
  generateRefreshToken(): Promise<string>;
  createdAt: Date;
  updatedAt: Date;
}
