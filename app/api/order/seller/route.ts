import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import { authOptions } from '@/lib/auth'; // double‑check this path

export async function GET() {
  try {
    const session = (await getServerSession(authOptions)) as (Session & {
      user: { id: string };
    }) | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findById(session.user.id);
    if (!user || !user.isSeller) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Build query – if you want to filter orders that contain products of this seller,
    // you would need a different approach. For now, we fetch all orders.
    let orders = await Order.find({})
      .populate('items.product')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    // If address is embedded, it's already included; no populate needed.
    // If address is a reference and you want to populate it, uncomment:
    // .populate('address')

    // Map to ensure the frontend gets the expected structure (optional)
    orders = orders.map(order => ({
      ...order.toObject(),
      // If address is embedded but you need to ensure fields exist:
      address: order.address || { fullName: '', area: '', city: '', state: '', phoneNumber: '' }
    }));

    return NextResponse.json(orders);
  } catch (error) {
    console.error('GET /api/order/seller error:', error);
    // In dev, return the full error message to help debugging:
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}