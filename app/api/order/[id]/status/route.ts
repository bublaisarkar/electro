import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import { authOptions } from '@/lib/auth';
import User from '@/models/User'; // ✅ now used

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = (await getServerSession(authOptions)) as Session | null;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase(); // moved up – needed for the user check too

    // ✅ Seller restriction – recommended
    const user = await User.findById(session.user.id);
    if (!user || !user.isSeller) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { status } = body;

    const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Allowed: pending, shipped, delivered, cancelled' },
        { status: 400 }
      );
    }

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    order.status = status;
    await order.save();

    await order.populate('items.product');
    await order.populate('address');

    return NextResponse.json(order);
  } catch (error) {
    console.error('PUT /api/order/[id]/status error:', error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}