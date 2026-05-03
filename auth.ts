import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import type { UserRole } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      image?: string
      role: UserRole
      department?: string
    }
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile",
          prompt: "select_account",
        },
      },
    }),
  ],
  session: { strategy: "database" },
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { id: true, role: true, department: true, activeStatus: true },
        })
        if (dbUser) {
          session.user.id = user.id
          session.user.role = dbUser.role
          session.user.department = dbUser.department ?? undefined
        }
      }
      return session
    },
    async signIn({ user }) {
      if (user.email) {
        await prisma.user.updateMany({
          where: { email: user.email },
          data: { lastLoginAt: new Date() },
        })
      }
      return true
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
})
