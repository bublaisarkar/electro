import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import PromoCode from '@/models/PromoCode';

export async function POST(req: Request) {
  try {
    const { code, amount } = await req.json();

    if (!code || !amount) {
      return NextResponse.json({ error: 'Code and amount required' }, { status: 400 });
    }

    await connectToDatabase();

    const promo = await PromoCode.findOne({
      code: code.toUpperCase(),
      active: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() },
    });

    if (!promo) {
      return NextResponse.json({ error: 'Invalid or expired promo code' }, { status: 400 });
    }

    // Check usage limit
    if (promo.usedCount >= promo.usageLimit) {
      return NextResponse.json({ error: 'Promo code usage limit reached' }, { status: 400 });
    }

    // Check minimum order amount
    if (amount < promo.minOrderAmount) {
      return NextResponse.json({
        error: `Minimum order amount is $${promo.minOrderAmount}`,
        minOrderAmount: promo.minOrderAmount,
      }, { status: 400 });
    }

    // Calculate discount
    let discount = 0;
    if (promo.discountType === 'percentage') {
      discount = (amount * promo.discountValue) / 100;
      if (promo.maxDiscount && discount > promo.maxDiscount) {
        discount = promo.maxDiscount;
      }
    } else {
      discount = promo.discountValue;
    }

    // Increment usage count
    promo.usedCount += 1;
    await promo.save();

    return NextResponse.json({
      discount,
      finalAmount: amount - discount,
      promoId: promo._id,
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
    });
  } catch (error) {
    console.error('POST /api/promo/apply error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}