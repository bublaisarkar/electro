import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import jwt, { JwtPayload } from 'jsonwebtoken';

// Define the exact shape of our mobile token
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
      // Cast the decoded token to our custom interface instead of 'any'
      const decoded = jwt.verify(token, secret) as CustomJwtPayload;
      
      return { 
        id: decoded.id, 
        isSeller: decoded.isSeller, 
        isAdmin: decoded.isAdmin 
      };
    } catch {
      // Removed the unused 'error' variable here to satisfy ESLint
      return null;
    }
  }
  return null;
}