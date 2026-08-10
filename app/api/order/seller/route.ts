import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next'; // ✅ correct import
import type { Session } from 'next-auth'; // ✅ type import
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User'; // for seller check
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // ✅ Type‑safe session with user.id
    const session = (await getServerSession(authOptions)) as (Session & {
      user: { id: string };
    }) | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // ✅ Restrict to sellers only
    const user = await User.findById(session.user.id);
    if (!user || !user.isSeller) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all orders (seller can see all)
    const orders = await Order.find({})
      .populate('items.product')
      .populate('address')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('GET /api/order/seller error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}