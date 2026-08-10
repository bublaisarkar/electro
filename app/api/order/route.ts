import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth'; // ✅ import the Session type
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Address from '@/models/Address';
import { authOptions } from '@/lib/auth';

// ─── GET all orders for the logged‑in user ───
export async function GET() {
  try {
    const session = (await getServerSession(authOptions)) as (Session & {
      user: { id: string };
    }) | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const orders = await Order.find({ user: session.user.id })
      .populate('items.product')
      .populate('address')
      .sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('GET /api/order error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// ─── POST create a new order ───
export async function POST(req: Request) {
  try {
    const session = (await getServerSession(authOptions)) as (Session & {
      user: { id: string };
    }) | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { items, addressId, paymentMethod, promoCode, discount } = body;

    // Validate required fields
    if (!items || !items.length || !addressId || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields: items, addressId, paymentMethod' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Verify address belongs to user
    const address = await Address.findOne({ _id: addressId, userId: session.user.id });
    if (!address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    // Calculate total and build order items
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 404 }
        );
      }
      if (!product.inStock) {
        return NextResponse.json(
          { error: `Product ${product.name} is out of stock` },
          { status: 400 }
        );
      }
      totalAmount += product.offerPrice * item.quantity;
      orderItems.push({ product: product._id, quantity: item.quantity });
    }

    // Apply discount (if any)
    let finalAmount = totalAmount;
    let appliedDiscount = 0;

    if (discount !== undefined && discount !== null) {
      const discountNum = Number(discount);
      if (isNaN(discountNum) || discountNum < 0) {
        return NextResponse.json(
          { error: 'Invalid discount value' },
          { status: 400 }
        );
      }
      appliedDiscount = Math.min(discountNum, totalAmount);
      finalAmount = totalAmount - appliedDiscount;
    }

    // Determine payment status
    const isFreeOrder = finalAmount <= 0.01;
    const paymentStatus = isFreeOrder ? 'Paid' : 'Pending';

    // Create order
    const orderData = {
      user: session.user.id,
      items: orderItems,
      amount: finalAmount,
      address: addressId,
      paymentMethod,
      paymentStatus,
      status: 'pending',
      promoCode: promoCode || null,
      discount: appliedDiscount,
    };

    const order = await Order.create(orderData);

    await order.populate('items.product');
    await order.populate('address');

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('POST /api/order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}