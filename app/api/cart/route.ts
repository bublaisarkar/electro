import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import '@/models/Product'; // 👈 CRITICAL: Force-registers the Product model for Mongoose population
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
  } catch (error: any) {
    console.error('GET /api/cart error stack:', error.message || error);
    return NextResponse.json({ error: 'Failed to fetch cart', details: error.message }, { status: 500 });
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

    if (!user.cart) {
      user.cart = [];
    }

    const itemIndex = user.cart.findIndex((item: any) => item.product.toString() === productId);

    if (itemIndex > -1) {
      user.cart[itemIndex].quantity += (quantity || 1);
    } else {
      user.cart.push({ product: productId, quantity: quantity || 1 });
    }

    await user.save();
    await user.populate('cart.product');

    return NextResponse.json({ items: user.cart });
  } catch (error: any) {
    console.error('POST /api/cart error stack:', error.message || error);
    return NextResponse.json({ error: 'Failed to update cart', details: error.message }, { status: 500 });
  }
}

// ─── DELETE remove item from cart ───
export async function DELETE(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 🛠️ Support both query parameters (reliable) and request body
    const { searchParams } = new URL(req.url);
    let productId = searchParams.get('productId');

    if (!productId) {
      try {
        const body = await req.json();
        productId = body?.productId;
      } catch (e) {
        // Ignore if body is empty
      }
    }

    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findById(authUser.id);
    if (user) {
      user.cart = (user.cart || []).filter((item: any) => item.product.toString() !== productId);
      await user.save();
      await user.populate('cart.product');
    }

    return NextResponse.json({ items: user?.cart || [] });
  } catch (error: any) {
    console.error('DELETE /api/cart error stack:', error.message || error);
    return NextResponse.json({ error: 'Failed to remove item', details: error.message }, { status: 500 });
  }
}