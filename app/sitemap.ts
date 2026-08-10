// app/sitemap.ts
import { MetadataRoute } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://your-store.vercel.app';

  // Static pages
  const staticPages = [
    '',
    '/all-products',
    '/about',
    '/contact',
    '/cart',
    '/search',
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    priority: path === '' ? 1.0 : 0.8,
  }));

  // Dynamic product pages
  try {
    await connectToDatabase();
    const products = await Product.find({}).select('_id updatedAt').lean();
    const productPages = products.map((product) => ({
      url: `${baseUrl}/product/${product._id}`,
      lastModified: product.updatedAt || new Date(),
      priority: 0.7,
    }));
    return [...staticPages, ...productPages];
  } catch (error) {
    console.error('Sitemap product fetch error:', error);
    return staticPages;
  }
}