import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { connectToDatabase } from '@/lib/mongodb';
import PromoCode from '@/models/PromoCode';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';

// ─── GET single promo code (public) ───
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅ Unwrap the Promise

    await connectToDatabase();
    const promo = await PromoCode.findById(id);
    if (!promo) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(promo);
  } catch (error) {
    console.error('GET /api/promo/[id] error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// ─── PUT update promo code (seller only) ───
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅ Unwrap the Promise

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a seller
    const user = await User.findById(session.user.id);
    if (!user?.isSeller) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();

    await connectToDatabase();

    const promo = await PromoCode.findByIdAndUpdate(
      id,
      { ...body, code: body.code?.toUpperCase() },
      { new: true, runValidators: true }
    );

    if (!promo) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(promo);
  } catch (error) {
    console.error('PUT /api/promo/[id] error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// ─── DELETE promo code (seller only) ───
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅ Unwrap the Promise

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(session.user.id);
    if (!user?.isSeller) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectToDatabase();

    const promo = await PromoCode.findByIdAndDelete(id);
    if (!promo) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/promo/[id] error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}