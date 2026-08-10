import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth'; // ✅ import type
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // ✅ Type‑safe session
    const session = (await getServerSession(authOptions)) as (Session & {
      user: { id: string };
    }) | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase(); // ✅ moved before using any model

    // Check if user is a seller
    const user = await User.findById(session.user.id);
    if (!user || !user.isSeller) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Total orders
    const totalOrders = await Order.countDocuments();

    // Total revenue (sum of paid orders)
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Total products
    const totalProducts = await Product.countDocuments();

    // Recent orders (last 5)
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Order status counts
    const statusCounts = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // ✅ Type‑safe status counts with a type guard
    const orderStatusCounts: { pending: number; shipped: number; delivered: number; cancelled: number } = {
      pending: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    const validStatuses = new Set(['pending', 'shipped', 'delivered', 'cancelled']);
    for (const item of statusCounts) {
      const status = item._id as string;
      if (validStatuses.has(status)) {
        orderStatusCounts[status as keyof typeof orderStatusCounts] = item.count;
      }
    }

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      totalProducts,
      recentOrders,
      orderStatusCounts,
    });
  } catch (error) {
    console.error('GET /api/seller/stats error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}