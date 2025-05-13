export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: string;
  avatar: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}
