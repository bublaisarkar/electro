import NextAuth from "next-auth/next"; // ✅ default import (no braces)
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };