import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Order, { IOrder } from '@/models/Order';
// Import the helper from your lib folder
import { getAuthUser } from '@/lib/getAuthUser';

type OrderDoc = IOrder & { user: { toString(): string } };

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Use the imported helper
    const user = await getAuthUser(req);
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const order = await Order.findById(id)
      .populate('items.product')
      .populate('address');

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const orderWithUser = order as OrderDoc;
    const isOwner = orderWithUser.user.toString() === user.id;
    const isStaff = user.isSeller || user.isAdmin; 

    if (!isOwner && !isStaff) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('GET /api/order/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Use the imported helper
    const user = await getAuthUser(req);
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.isSeller && !user.isAdmin) {
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

    await connectToDatabase();

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
    console.error('PUT /api/order/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}