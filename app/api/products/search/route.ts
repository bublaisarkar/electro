import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';

    await connectToDatabase();

    let products = [];
    if (q.trim()) {
      const searchRegex = new RegExp(q, 'i');
      products = await Product.find({
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { category: searchRegex },
        ],
      }).sort({ createdAt: -1 });
    } else {
      // If no query, return all products (or empty array)
      products = await Product.find({}).sort({ createdAt: -1 });
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Failed to search products' }, { status: 500 });
  }
}