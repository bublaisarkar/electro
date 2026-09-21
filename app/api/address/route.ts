import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { connectToDatabase } from '@/lib/mongodb';
import Address from '@/models/Address';
import { authOptions } from '@/lib/auth';
import { getAuthUser } from '@/lib/getAuthUser';
import mongoose from 'mongoose';

async function getUserIdFromRequest(req: Request): Promise<string | null> {
  // 1. Try NextAuth session (Web)
  const session = (await getServerSession(authOptions)) as Session | null;
  if (session?.user?.id) {
    return session.user.id;
  }

  // 2. Fallback to mobile Bearer token via getAuthUser
  const authUser = await getAuthUser(req);
  if (authUser?.id) {
    return authUser.id;
  }

  return null;
}

export async function GET(req: Request) {
  try {
    const userIdStr = await getUserIdFromRequest(req);
    if (!userIdStr) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const objectId = new mongoose.Types.ObjectId(userIdStr);
    const addresses = await Address.find({ userId: objectId }).sort({ createdAt: -1 });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error('GET /api/address error:', error);
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userIdStr = await getUserIdFromRequest(req);
    if (!userIdStr) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // 🛠️ Normalize and map fields to match your Mongoose Address schema properties exactly
    const normalizedData = {
      area: body.street || body.area || '',
      city: body.city || '',
      state: body.state || '',
      pincode: body.postalCode || body.pincode || '',
      country: body.country || 'India',
      fullName: body.fullName || 'User',         // Fallback to satisfy schema requirement
      phoneNumber: body.phoneNumber || '0000000000', // Fallback to satisfy schema requirement
    };

    // Validate required fields based on schema expectations
    const required = ['area', 'city', 'state', 'pincode'];
    const missing = required.filter((field) => !normalizedData[field as keyof typeof normalizedData]);
    
    if (missing.length) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const objectId = new mongoose.Types.ObjectId(userIdStr);
    await Address.create({
      ...normalizedData,
      userId: objectId,
    });

    // Return the full updated list of addresses
    const allAddresses = await Address.find({ userId: objectId }).sort({ createdAt: -1 });

    return NextResponse.json(allAddresses, { status: 201 });
  } catch (error) {
    console.error('POST /api/address error:', error);
    return NextResponse.json({ error: 'Failed to create address' }, { status: 500 });
  }
}