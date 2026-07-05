import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { analyzeSentiment, extractTopics, extractKeywords } from '../route';

// POST /api/reviews/analyze - Re-analyze all reviews with AI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewIds } = body;

    const reviews = reviewIds && reviewIds.length > 0
      ? await db.review.findMany({ where: { id: { in: reviewIds } } })
      : await db.review.findMany();

    let updated = 0;
    for (const review of reviews) {
      const { sentiment, confidence } = analyzeSentiment(review.content, review.rating);
      const topics = extractTopics(review.content);
      const keywords = extractKeywords(review.content);

      await db.review.update({
        where: { id: review.id },
        data: {
          sentiment,
          confidence: Math.round(confidence * 100) / 100,
          topics: JSON.stringify(topics),
          keywords: JSON.stringify(keywords),
        },
      });
      updated++;
    }

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error('Error analyzing reviews:', error);
    return NextResponse.json({ error: 'Failed to analyze reviews' }, { status: 500 });
  }
}

// POST /api/reviews/analyze/bulk - Bulk import reviews from CSV text
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviews: reviewsData } = body;

    if (!Array.isArray(reviewsData)) {
      return NextResponse.json({ error: 'Invalid reviews data' }, { status: 400 });
    }

    const created: any[] = [];
    for (const item of reviewsData) {
      const { author, rating, content, productName } = item;
      if (!content || !rating) continue;

      const { sentiment, confidence } = analyzeSentiment(content, parseInt(rating));
      const topics = extractTopics(content);
      const keywords = extractKeywords(content);

      const review = await db.review.create({
        data: {
          author: author || 'Anonymous',
          rating: parseInt(rating),
          content,
          sentiment,
          confidence: Math.round(confidence * 100) / 100,
          topics: JSON.stringify(topics),
          keywords: JSON.stringify(keywords),
          source: 'csv',
          productName: productName || '',
        },
      });
      created.push(review);
    }

    return NextResponse.json({ success: true, created: created.length });
  } catch (error) {
    console.error('Error bulk importing reviews:', error);
    return NextResponse.json({ error: 'Failed to import reviews' }, { status: 500 });
  }
}