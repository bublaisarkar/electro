import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a seller
    const user = await User.findById(session.user.id);
    if (!user || !user.isSeller) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectToDatabase();

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

    const orderStatusCounts = { pending: 0, shipped: 0, delivered: 0, cancelled: 0 };
    statusCounts.forEach((item) => {
      if (item._id in orderStatusCounts) {
        orderStatusCounts[item._id] = item.count;
      }
    });

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