import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { AUTH_CONFIG } from "./constants";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email e senha são obrigatórios");
          }
          
          const user = await db
            .select({
              id: users.id,
              email: users.email,
              name: users.name,
              role: users.role,
              hashedPassword: users.hashedPassword
            })
            .from(users)
            .where(eq(users.email, credentials.email.toLowerCase().trim()))
            .limit(1)
            .then((res: any) => res[0]);

          if (!user) {
            throw new Error("Usuário não encontrado");
          }

          if (!user.hashedPassword) {
            throw new Error("Conta sem senha configurada");
          }
          
          const isPasswordValid = await compare(credentials.password, user.hashedPassword);

          if (!isPasswordValid) {
            throw new Error("Senha incorreta");
          }

          const authorizedUser = {
            id: user.id,
            email: user.email,
            name: user.name || user.email,
            role: user.role || "VIEWER"
          };
          
          return authorizedUser;

        } catch (error) {
          console.error("Authentication failed:", error instanceof Error ? error.message : String(error));
          return null;
        }
      }
    })
  ],
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.userId as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    
    async redirect({ url, baseUrl }) {
      if (url === "/" || url === baseUrl || url.startsWith(baseUrl + "/")) {
        return baseUrl;
      }
      return url;
    }
  },

  pages: {
    signIn: '/sign-in',
    error: '/sign-in'
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },

  secret: AUTH_CONFIG.NEXTAUTH_SECRET,
  debug: false,
}; 