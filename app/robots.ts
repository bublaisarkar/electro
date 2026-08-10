// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://your-store.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/seller/', '/profile/', '/cart/', '/auth/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}