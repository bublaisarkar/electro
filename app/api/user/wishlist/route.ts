import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
import { getAuthUser } from '@/lib/getAuthUser';
import mongoose from 'mongoose';

// ─── GET: Fetch the user's wishlist ───
export async function GET(req: NextRequest) {
  try {
    // ✅ Uses dual-auth helper (supports both Web cookies and Mobile Bearer tokens)
    const authUser = await getAuthUser(req);

    if (!authUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findById(authUser.id).populate({
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
export async function POST(req: NextRequest) {
  try {
    // ✅ Uses dual-auth helper
    const authUser = await getAuthUser(req);

    if (!authUser?.id) {
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

    const user = await User.findById(authUser.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const wishlist = user.wishlist || [];
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