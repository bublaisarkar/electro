import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 400 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 400 }
      );
    }

    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error('CRITICAL: NEXTAUTH_SECRET is not defined!');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // FIXED: Use 'id' (matching getAuthUser) and include role flags
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
      { message: 'Logged in successfully', token, user: userObj },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}