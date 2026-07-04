import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const reviews = await db.review.findMany({ orderBy: { createdAt: 'desc' } });
    
    const csvHeader = 'ID,Author,Rating,Content,Sentiment,Confidence,Topics,Keywords,Product,Date\n';
    const csvRows = reviews.map(r => {
      const content = `"${r.content.replace(/"/g, '""')}"`;
      const topics = `"${(JSON.parse(r.topics || '[]') as string[]).join(', ')}"`;
      const keywords = `"${(JSON.parse(r.keywords || '[]') as string[]).join(', ')}"`;
      return `${r.id},${r.author},${r.rating},${content},${r.sentiment},${r.confidence},${topics},${keywords},"${r.productName}",${r.createdAt.toISOString()}`;
    }).join('\n');

    return new NextResponse(csvHeader + csvRows, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="reviews-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting reviews:', error);
    return NextResponse.json({ error: 'Failed to export reviews' }, { status: 500 });
  }
}