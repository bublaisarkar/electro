import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface CustomJwtPayload extends JwtPayload {
  id: string;
  isSeller: boolean;
  isAdmin: boolean;
}

export async function getAuthUser(req: Request) {
  // 1. Try Web Auth (NextAuth Cookies)
  const session = await getServerSession(authOptions);
  if (session?.user?.id) return session.user;

  // 2. Try Mobile Auth (Bearer Token)
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const secret = process.env.NEXTAUTH_SECRET || 'fallback_secret';
      const decoded = jwt.verify(token, secret) as CustomJwtPayload;
      
      return { 
        id: decoded.id, 
        isSeller: decoded.isSeller, 
        isAdmin: decoded.isAdmin 
      };
    } catch (err: any) {
      // This will print the exact reason (e.g., "invalid signature", "jwt expired") in your Next.js console
      console.error('JWT Verification Failed in getAuthUser:', err.message);
      return null;
    }
  }
  return null;
}