import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth'; // ✅ import the Session type
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';

// ─── GET: Fetch the user's wishlist ───
export async function GET() {
  try {
    // ✅ Type‑safe session
    const session = (await getServerSession(authOptions)) as (Session & {
      user: { id: string };
    }) | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findById(session.user.id).populate({
      path: 'wishlist',
      model: Product,
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user.wishlist || []);
  } catch (error) {
    console.error('GET /api/user/wishlist error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}

// ─── POST: Toggle a product in the wishlist ───
export async function POST(req: Request) {
  try {
    // ✅ Type‑safe session
    const session = (await getServerSession(authOptions)) as (Session & {
      user: { id: string };
    }) | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const wishlist = user.wishlist || [];
    // ✅ Explicitly type the callback parameter
    const index = wishlist.findIndex(
      (id: mongoose.Types.ObjectId) => id.toString() === productId
    );

    let action: 'added' | 'removed';

    if (index > -1) {
      wishlist.splice(index, 1);
      action = 'removed';
    } else {
      wishlist.push(new mongoose.Types.ObjectId(productId));
      action = 'added';
    }

    user.wishlist = wishlist;
    await user.save();

    return NextResponse.json({
      action,
      wishlist: user.wishlist,
      message: action === 'added' ? 'Added to wishlist' : 'Removed from wishlist',
    });
  } catch (error) {
    console.error('POST /api/user/wishlist error:', error);
    return NextResponse.json(
      { error: 'Failed to update wishlist' },
      { status: 500 }
    );
  }
}