import { db } from "../db.js";
// import { UserInput } from "../types/user.types.ts";

type UserInput = {
  email: string;
  password: string;
  name: string;
  phone?: string;
};

export const userResolvers = {
  Query: {
    getUser: async (_: any, { id }: { id: string }) => {
      const { data, error } = await db
        .from("users")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  },
  User: {
    __resolveReference: async (user: { id: string }) => {
      const { data, error } = await db
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  },
  Mutation: {
    createUser: async (_: any, { input }: { input: UserInput }) => {
      const { name, email, password, phone } = input;
      let orCondition = `email.eq.${email}`;
      if (phone) {
        orCondition += `,phone.eq.${phone}`;
      }
      const { data, error } = await db
        .from("users")
        .select("*")
        .or(orCondition)
        .maybeSingle();
      if (error) {
        throw new Error(error.message);
      }
      if (data) {
        throw new Error("User already exists with this email or phone number");
      }
      const { data: signupData, error: authError } =
        await db.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });
      if (authError) {
        throw new Error(authError.message);
      }
      const { data: user, error: insertError } = await db
        .from("users")
        .insert([{ id: signupData.user.id, email, name, phone }])
        .select()
        .single();
      if (insertError) {
        throw new Error(insertError.message);
      }
      return user;
    },
    upgradeToSeller: async (_: any, { userId }: { userId: string }) => {
      const { data, error } = await db
        .from("users")
        .update({ role: "seller" })
        .eq("id", userId)
        .select()
        .single();
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  },
};
