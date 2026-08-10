import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth'; // ✅ import type
import { connectToDatabase } from '@/lib/mongodb';
import Category from '@/models/Category';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';

// ─── GET all categories (public) ───
export async function GET() {
  try {
    await connectToDatabase();
    const categories = await Category.find({}).sort({ name: 1 });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('GET /api/categories error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// ─── POST create a new category (admin/seller only) ───
export async function POST(req: Request) {
  try {
    // ✅ Type‑safe session
    const session = (await getServerSession(authOptions)) as (Session & {
      user: { id: string };
    }) | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Check if user is seller or admin
    const user = await User.findById(session.user.id);
    if (!user || (!user.isSeller && !user.isAdmin)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, description } = await req.json();

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Check if category already exists (case‑insensitive)
    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'Category already exists' },
        { status: 409 }
      );
    }

    // Generate slug manually as a fallback
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const category = await Category.create({
      name: name.trim(),
      slug,
      description: description || '',
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    // ✅ Type‑safe error handling
    // Check for MongoDB duplicate key error (code 11000)
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 409 }
      );
    }

    console.error('POST /api/categories error:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}