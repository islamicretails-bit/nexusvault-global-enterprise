import { NextResponse } from 'next/server';
import { getProducts } from '../lib/product';
import { getPages } from '../lib/page';
import { getBlogs } from '../lib/blog';

export async function GET() {
  const products = await getProducts();
  const pages = await getPages();
  const blogs = await getBlogs();

  const sitemap = `
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${pages.map((page) => `
        <url>
          <loc>${page.url}</loc>
          <changefreq>monthly</changefreq>
          <priority>0.5</priority>
        </url>
      `).join('')}
      ${products.map((product) => `
        <url>
          <loc>${product.url}</loc>
          <changefreq>monthly</changefreq>
          <priority>0.5</priority>
        </url>
      `).join('')}
      ${blogs.map((blog) => `
        <url>
          <loc>${blog.url}</loc>
          <changefreq>monthly</changefreq>
          <priority>0.5</priority>
        </url>
      `).join('')}
    </urlset>
  `;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}