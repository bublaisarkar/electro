import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import razorpay from '@/lib/razorpay';
import { getAuthUser } from '@/lib/getAuthUser'; // ✅ Import your dual-auth helper

export async function POST(req: Request) {
  try {
    // ✅ Use getAuthUser to support both mobile JWT tokens and web sessions
    const user = await getAuthUser(req);
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await (req as any).json();
    const { orderId } = body || {};
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.user.toString() !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (order.paymentStatus === 'Paid') {
      return NextResponse.json(
        { error: 'Order already paid' },
        { status: 400 }
      );
    }
    if (order.razorpayOrderId) {
      return NextResponse.json(
        { error: 'Payment already initiated' },
        { status: 400 }
      );
    }

    const amount = Number(order.amount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid order amount' },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      console.error('RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing');
      return NextResponse.json(
        { error: 'Payment configuration error' },
        { status: 500 }
      );
    }

    // Create Razorpay order
    const amountInPaise = Math.round(amount * 100);
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `order_${order._id}`,
      notes: {
        orderId: order._id.toString(),
        userId: user.id,
      },
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return NextResponse.json({
      razorpayOrderId: razorpayOrder.id,
      amount: order.amount,
      currency: 'INR',
      key: keyId,
    });
  } catch (error) {
    console.error('POST /api/payment/create-order error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create payment order', details: message },
      { status: 500 }
    );
  }
}