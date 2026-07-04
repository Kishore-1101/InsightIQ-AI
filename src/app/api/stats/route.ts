import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const totalReviews = await db.review.count();
    
    const reviews = await db.review.findMany();
    
    // Average rating
    const avgRating = reviews.length > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
      : 0;

    // Sentiment distribution
    const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
    reviews.forEach(r => {
      if (r.sentiment in sentimentCounts) {
        sentimentCounts[r.sentiment as keyof typeof sentimentCounts]++;
      }
    });

    const sentimentPcts = {
      positive: totalReviews > 0 ? Math.round((sentimentCounts.positive / totalReviews) * 100) : 0,
      negative: totalReviews > 0 ? Math.round((sentimentCounts.negative / totalReviews) * 100) : 0,
      neutral: totalReviews > 0 ? Math.round((sentimentCounts.neutral / totalReviews) * 100) : 0,
    };

    // NPS Score (Promoters 4-5, Passives 3, Detractors 1-2)
    const promoters = reviews.filter(r => r.rating >= 4).length;
    const detractors = reviews.filter(r => r.rating <= 2).length;
    const nps = totalReviews > 0 ? Math.round(((promoters - detractors) / totalReviews) * 100) : 0;

    // Rating distribution
    const ratingDist = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: reviews.filter(r => r.rating === rating).length,
    }));

    // Product breakdown
    type SentimentKey = 'positive' | 'negative' | 'neutral';
    const productMap: Record<string, { count: number; totalRating: number; sentiments: Record<SentimentKey, number> }> = {};
    reviews.forEach(r => {
      const name = r.productName || 'Unknown';
      if (!productMap[name]) {
        productMap[name] = { count: 0, totalRating: 0, sentiments: { positive: 0, negative: 0, neutral: 0 } };
      }
      productMap[name].count++;
      productMap[name].totalRating += r.rating;
      const sKey = r.sentiment as SentimentKey;
      if (sKey in productMap[name].sentiments) {
        productMap[name].sentiments[sKey]++;
      }
    });

    const productStats = Object.entries(productMap).map(([name, data]) => ({
      name,
      count: data.count,
      avgRating: Math.round((data.totalRating / data.count) * 10) / 10,
      positivePct: Math.round((data.sentiments.positive / data.count) * 100),
      negativePct: Math.round((data.sentiments.negative / data.count) * 100),
      neutralPct: Math.round((data.sentiments.neutral / data.count) * 100),
    }));

    // Topic frequency
    const topicMap: Record<string, number> = {};
    reviews.forEach(r => {
      try {
        const topics: string[] = JSON.parse(r.topics);
        topics.forEach(t => {
          topicMap[t] = (topicMap[t] || 0) + 1;
        });
      } catch {}
    });

    const topicStats = Object.entries(topicMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Keyword frequency (word cloud data)
    const keywordMap: Record<string, number> = {};
    reviews.forEach(r => {
      try {
        const keywords: string[] = JSON.parse(r.keywords);
        keywords.forEach(k => {
          keywordMap[k] = (keywordMap[k] || 0) + 1;
        });
      } catch {}
    });

    const keywordStats = Object.entries(keywordMap)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 50);

    // Average confidence
    const avgConfidence = reviews.length > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.confidence, 0) / reviews.length) * 100)
      : 0;

    // Recent trend (last 10 reviews sentiment)
    const recentReviews = [...reviews].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 10);
    const trendData = recentReviews.map(r => ({
      date: r.createdAt.toISOString().split('T')[0],
      sentiment: r.sentiment === 'positive' ? 1 : r.sentiment === 'negative' ? -1 : 0,
      rating: r.rating,
    }));

    return NextResponse.json({
      totalReviews,
      avgRating,
      nps,
      sentimentCounts,
      sentimentPcts,
      ratingDist,
      productStats,
      topicStats,
      keywordStats,
      avgConfidence,
      trendData,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}