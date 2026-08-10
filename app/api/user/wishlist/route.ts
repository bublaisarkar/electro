import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';

// ─── GET: Fetch the user's wishlist ───
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
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

    // Return the populated wishlist array (or empty array if not present)
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
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Find the user
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Ensure wishlist is an array
    const wishlist = user.wishlist || [];
    const index = wishlist.findIndex(
      (id) => id.toString() === productId
    );

    let action: 'added' | 'removed';

    if (index > -1) {
      // Remove from wishlist
      wishlist.splice(index, 1);
      action = 'removed';
    } else {
      // Add to wishlist
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