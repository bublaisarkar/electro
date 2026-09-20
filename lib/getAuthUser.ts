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
    
    // 🔍 Diagnostic check to see if secret exists in production
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error('CRITICAL: NEXTAUTH_SECRET is missing in Vercel environment variables!');
      return null;
    }

    try {
      const decoded = jwt.verify(token, secret) as CustomJwtPayload;
      return { 
        id: decoded.id, 
        isSeller: decoded.isSeller, 
        isAdmin: decoded.isAdmin 
      };
    } catch (err: any) {
      console.error('--- JWT VERIFICATION FAILED ---');
      console.error('Error Message:', err.message);
      console.error('Token received (first 15 chars):', token.substring(0, 15) + '...');
      console.error('--------------------------------');
      return null;
    }
  }

  console.error('getAuthUser: No Session and No Authorization Header found.');
  return null;
}