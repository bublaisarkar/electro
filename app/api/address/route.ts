import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { connectToDatabase } from '@/lib/mongodb';
import Address from '@/models/Address';
import { authOptions } from "@/lib/auth";
import mongoose from 'mongoose';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // ✅ Convert to ObjectId to match the schema
    const userId = new mongoose.Types.ObjectId(session.user.id);
    const addresses = await Address.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error('GET /api/address error:', error);
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const required = ['fullName', 'phoneNumber', 'pincode', 'area', 'city', 'state'];
    const missing = required.filter((field) => !body[field]);
    if (missing.length) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // ✅ Save with ObjectId
    const address = await Address.create({
      ...body,
      userId: new mongoose.Types.ObjectId(session.user.id),
    });

    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    console.error('POST /api/address error:', error);
    return NextResponse.json({ error: 'Failed to create address' }, { status: 500 });
  }
}