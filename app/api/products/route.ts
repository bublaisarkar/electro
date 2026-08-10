import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import type { Session } from 'next-auth';

// ─── Helper: get typed session ───
async function getTypedSession(): Promise<Session | null> {
  return await getServerSession(authOptions);
}

// ─── GET all products (public) ───
export async function GET() {
  try {
    await connectToDatabase();
    const products = await Product.find({}).sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch (error) {
    console.error('GET /api/products error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch products', details: message },
      { status: 500 }
    );
  }
}

// ─── POST new product (seller or admin only) ───
export async function POST(req: NextRequest) {
  try {
    const session = await getTypedSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use type assertion to access custom fields (isSeller, isAdmin)
    const user = session.user as {
      id: string;
      isSeller?: boolean;
      isAdmin?: boolean;
    };

    const isAuthorized = user.isSeller === true || user.isAdmin === true;
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Forbidden – only sellers or admins can add products' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const body = await req.json();

    // Validate required fields
    const required = ['name', 'description', 'category', 'price', 'offerPrice', 'image'];
    const missing = required.filter((field) => !body[field]);
    if (missing.length) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    // Ensure image is an array
    if (!Array.isArray(body.image)) {
      body.image = [body.image];
    }

    // Add sellerId
    body.sellerId = user.id;

    const product = await Product.create(body);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('POST /api/products error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create product', details: message },
      { status: 500 }
    );
  }
}