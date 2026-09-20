import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
import { getAuthUser } from '@/lib/getAuthUser';

// ─── GET cart for the logged-in user ───
export async function GET(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const user = await User.findById(authUser.id).populate('cart.product');
    if (!user) {
      return NextResponse.json({ items: [] });
    }

    return NextResponse.json({ items: user.cart || [] });
  } catch (error) {
    console.error('GET /api/cart error:', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

// ─── POST add or update item in cart ───
export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, quantity } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findById(authUser.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const itemIndex = user.cart.findIndex((item: any) => item.product.toString() === productId);

    if (itemIndex > -1) {
      // Update quantity if item already exists
      user.cart[itemIndex].quantity += (quantity || 1);
    } else {
      // Add new item
      user.cart.push({ product: productId, quantity: quantity || 1 });
    }

    await user.save();
    await user.populate('cart.product');

    return NextResponse.json({ items: user.cart });
  } catch (error) {
    console.error('POST /api/cart error:', error);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}

// ─── DELETE remove item from cart ───
export async function DELETE(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await req.json();
    await connectToDatabase();

    const user = await User.findById(authUser.id);
    if (user) {
      user.cart = user.cart.filter((item: any) => item.product.toString() !== productId);
      await user.save();
      await user.populate('cart.product');
    }

    return NextResponse.json({ items: user?.cart || [] });
  } catch (error) {
    console.error('DELETE /api/cart error:', error);
    return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 });
  }
}