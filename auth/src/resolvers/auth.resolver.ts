import { db } from "../db.ts";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "a-super-secret-key-that-is-at-least-32-characters-long";

export const authResolvers = {
  Mutation: {
    validateUser: async (
      _parent: any,
      args: { input: { email: string; password: string } }
    ) => {
      const { data, error } = await db.auth.signInWithPassword({
        email: args.input.email,
        password: args.input.password,
      });
      if (error) {
        throw new Error(error.message);
      }
      if (!data.user) {
        throw new Error("Invalid credentials");
      }
      const { data: user_data, error: db_error } = await db
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single();
      if (db_error) {
        throw new Error(db_error.message);
      }

      const user = {
        id: data.user.id,
        email: data.user.email!,
        role: user_data.role || "customer",
      };

      const token = jwt.sign(user, JWT_SECRET, { expiresIn: "1h" });

      return {
        id: data.user.id,
        email: data.user.email!,
        name: user_data.name || "",
        phone: user_data.phone || "",
        role: user_data.role || "customer",
        token,
      };
    },
    changePassword: async (
      _parent: any,
      args: { email: string; currentPassword: string; newPassword: string }
    ) => {
      const { data, error } = await db.auth.signInWithPassword({
        email: args.email,
        password: args.currentPassword,
      });
      if (error) {
        throw new Error("Current password is incorrect");
      }
      if (!data.user) {
        throw new Error("User not found");
      }
      const { error: updateError } = await db.auth.admin.updateUserById(
        data.user.id,
        {
          password: args.newPassword,
        }
      );
      if (error) {
        throw new Error(error);
      }
      return {
        message: "Password changed successfully",
        access_token: data.session?.access_token || "",
        refresh_token: data.session?.refresh_token || "",
      };
    },
  },
};
