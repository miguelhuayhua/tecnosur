import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      registrado: boolean
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    registrado: boolean;
  }

  interface JWT {
    id: string;
    registrado: boolean;
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    registrado: boolean;
  }
}