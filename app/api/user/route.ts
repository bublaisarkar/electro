import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import Address from '@/models/Address'; // ✅ Import the model
import { authOptions } from '@/lib/auth';

// ─── GET: Fetch the current user's profile ───
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Fetch user
    const user = await User.findById(session.user.id).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // ✅ Manually fetch addresses instead of using populate
    const addresses = await Address.find({ userId: user._id }).sort({ createdAt: -1 });

    // Convert to plain object and attach addresses
    const userObj = user.toObject();
    userObj.addresses = addresses;

    return NextResponse.json(userObj);
  } catch (error) {
    console.error('GET /api/user error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

// ─── PUT: Update the current user's profile ───
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, image } = await req.json();

    if (!name && !image) {
      return NextResponse.json(
        { error: 'At least one field (name or image) is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updateData: Partial<{ name: string; image: string }> = {};
    if (name) updateData.name = name.trim();
    if (image) updateData.image = image;

    const user = await User.findByIdAndUpdate(
      session.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('PUT /api/user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
}