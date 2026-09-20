import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'Google ID token is required' },
        { status: 400 }
      );
    }

    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.json(
        { error: 'Invalid Google token' },
        { status: 400 }
      );
    }

    const { email, name, picture } = payload;

    await connectToDatabase();

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: name || 'Google User',
        email,
        password: null, 
        isSeller: false,
        isAdmin: false,
        image: picture || null,
      });
    }

    // Ensure NEXTAUTH_SECRET is properly configured
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error('CRITICAL: NEXTAUTH_SECRET is not defined in environment variables!');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Sign token securely matching getAuthUser expectations
    const token = jwt.sign(
      { 
        id: user._id.toString(), 
        email: user.email,
        isSeller: user.isSeller || false,
        isAdmin: user.isAdmin || false
      },
      secret,
      { expiresIn: '30d' }
    );

    const userObj = user.toObject();
    delete userObj.password;

    return NextResponse.json(
      { message: 'Google login successful', token, user: userObj },
      { status: 200 }
    );
  } catch (error) {
    console.error('Google mobile auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error during Google authentication' },
      { status: 500 }
    );
  }
}