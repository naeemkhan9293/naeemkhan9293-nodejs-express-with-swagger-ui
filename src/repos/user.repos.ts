import User from "#src/models/user";
import { IUser } from "#src/types/common";
import { Types } from "mongoose";

const getUserById = async (id: Types.ObjectId): Promise<IUser | null> => {
  return User.findById(id);
};

const getUserByEmail = async (email: string): Promise<IUser | null> => {
  return User.findOne({ email });
};

/**
 * Get a user by email with password included for authentication
 * @param email - The email of the user
 * @returns The user document with password or null if not found
 */
const getUserByEmailWithPassword = async (email: string): Promise<IUser | null> => {
  return User.findOne({ email }).select("+password");
};

const getUserByUsername = async (username: string): Promise<IUser | null> => {
  return User.findOne({ username });
};

const createUser = async (userData: Partial<IUser>): Promise<IUser> => {
  const newUser = new User(userData);
  return newUser.save();
};

const updateUser = async (
  id: Types.ObjectId,
  updateData: Partial<IUser>
): Promise<IUser | null> => {
  return User.findByIdAndUpdate(id, updateData, { new: true });
};

const deleteUser = async (id: Types.ObjectId): Promise<IUser | null> => {
  return User.findByIdAndDelete(id);
};

const getAllUsers = async (): Promise<IUser[]> => {
  return User.find();
};

const userRepos = {
  getUserById,
  getUserByEmail,
  getUserByEmailWithPassword,
  getUserByUsername,
  createUser,
  updateUser,
  deleteUser,
  getAllUsers,
};

export default userRepos;
