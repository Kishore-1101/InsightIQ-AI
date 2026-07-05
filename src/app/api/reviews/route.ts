import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Shared sentiment analysis logic
export function analyzeSentiment(text: string, rating: number): { sentiment: string; confidence: number } {
  const positiveWords = ['love', 'excellent', 'outstanding', 'great', 'perfect', 'best', 'amazing', 'incredible', 'fantastic', 'wonderful', 'impressive', 'beautiful', 'phenomenal', 'blazing', 'solid', 'highly recommend', 'satisfied', 'champion', 'flawless', 'lightning', 'game changer', 'rivals', 'pleased', 'enjoy', 'smooth', 'good', 'nice', 'helpful', 'reliable'];
  const negativeWords = ['terrible', 'worst', 'disappointed', 'poor', 'defective', 'buggy', 'stopped', 'failed', 'frustrating', 'unresponsive', 'noisy', 'overpriced', 'waste', 'broken', 'struggles', 'lacking', 'unreliable', 'chaotic', 'stuck', 'leaked', 'cracked', 'dead', 'laggy', 'rude', 'condescending', 'nightmare', 'awful', 'useless', 'bad', 'horrible', 'hate', 'annoying', 'cheap'];
  
  const lowerText = text.toLowerCase();
  let posCount = 0;
  let negCount = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) posCount++;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) negCount++;
  });
  
  const total = posCount + negCount;
  if (total === 0) {
    if (rating >= 4) return { sentiment: 'positive', confidence: 0.55 + (rating - 4) * 0.15 };
    if (rating <= 2) return { sentiment: 'negative', confidence: 0.55 + (2 - rating) * 0.15 };
    return { sentiment: 'neutral', confidence: 0.5 };
  }
  
  const ratio = posCount / total;
  if (ratio > 0.6) return { sentiment: 'positive', confidence: Math.min(0.95, 0.7 + (ratio - 0.6) * 0.5) };
  if (ratio < 0.4) return { sentiment: 'negative', confidence: Math.min(0.95, 0.7 + (0.4 - ratio) * 0.5) };
  return { sentiment: 'neutral', confidence: 0.5 };
}

export function extractTopics(text: string): string[] {
  const topicKeywords: Record<string, string[]> = {
    'Build Quality': ['build quality', 'sturdy', 'durable', 'construction', 'materials'],
    'Battery Life': ['battery', 'charge', 'charging', 'battery life', 'power'],
    'Customer Service': ['customer service', 'support', 'warranty', 'replacement', 'refund', 'returns', 'customer support'],
    'Sound Quality': ['sound', 'audio', 'bass', 'treble', 'frequency', 'speakers', 'earbud'],
    'Design': ['design', 'sleek', 'elegant', 'beautiful', 'modern', 'looks', 'display', 'bezel'],
    'Value for Money': ['value', 'price', 'overpriced', 'money', 'worth', 'affordable'],
    'Performance': ['performance', 'fast', 'speed', 'powerful', 'processor', 'handles', 'compile'],
    'Comfort': ['comfortable', 'comfort', 'wear', 'lightweight', 'weight', 'heavy'],
    'Connectivity': ['bluetooth', 'wifi', 'connection', 'wireless', 'connect', 'disconnection'],
    'Software': ['software', 'app', 'firmware', 'update', 'buggy', 'bugs', 'interface', 'laggy'],
    'Durability': ['broke', 'cracked', 'stopped working', 'failed', 'defective', 'dead', 'overheat'],
    'Ease of Use': ['easy', 'setup', 'simple', 'intuitive', 'complicated', 'difficult', 'cleaning', 'maintain'],
    'Display Quality': ['display', 'screen', 'bright', 'resolution', 'pixel', 'color accuracy'],
    'Cleaning Performance': ['clean', 'cleaning', 'vacuum', 'dust', 'suction', 'mopping', 'debris'],
    'Health & Fitness': ['fitness', 'health', 'heart rate', 'sleep', 'steps', 'workout', 'blood oxygen', 'swim'],
  };
  
  const lowerText = text.toLowerCase();
  const topics: string[] = [];
  
  Object.entries(topicKeywords).forEach(([topic, keywords]) => {
    if (keywords.some(kw => lowerText.includes(kw))) {
      topics.push(topic);
    }
  });
  
  return topics.length > 0 ? topics : ['General'];
}

export function extractKeywords(text: string): string[] {
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'and', 'but', 'or', 'nor', 'not', 'so', 'yet', 'both', 'either', 'neither', 'each', 'every', 'all', 'any', 'few', 'more', 'most', 'other', 'some', 'such', 'only', 'own', 'same', 'than', 'too', 'very', 'just', 'because', 'when', 'where', 'how', 'what', 'which', 'who', 'this', 'that', 'these', 'those', 'also', 'about', 'even', 'well', 'still', 'much', 'from', 'like', 'work', 'works', 'working', 'doesnt', 'dont', 'didnt', 'wont', 'cant', 'isnt', 'arent', 'wasnt', 'werent']);
  
  const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
  const freq: Record<string, number> = {};
  
  words.forEach(word => {
    if (word.length > 3 && !stopWords.has(word)) {
      freq[word] = (freq[word] || 0) + 1;
    }
  });
  
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);
}

// GET /api/reviews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sentiment = searchParams.get('sentiment');
    const rating = searchParams.get('rating');
    const product = searchParams.get('product');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sort = searchParams.get('sort') || 'newest';

    const where: Record<string, unknown> = {};
    if (sentiment && sentiment !== 'all') where.sentiment = sentiment;
    if (rating) where.rating = parseInt(rating);
    if (product && product !== 'all') where.productName = product;
    if (search) {
      where.OR = [
        { content: { contains: search } },
        { author: { contains: search } },
        { productName: { contains: search } },
      ];
    }

    const orderBy = sort === 'oldest' ? { createdAt: 'asc' as const } 
                   : sort === 'rating-high' ? { rating: 'desc' as const }
                   : sort === 'rating-low' ? { rating: 'asc' as const }
                   : { createdAt: 'desc' as const };

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.review.count({ where }),
    ]);

    return NextResponse.json({
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// POST /api/reviews
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { author, rating, content, productName, source } = body;

    if (!content || !rating || !author) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { sentiment, confidence } = analyzeSentiment(content, rating);
    const topics = extractTopics(content);
    const keywords = extractKeywords(content);

    const review = await db.review.create({
      data: {
        id: uuidv4(),
        author,
        rating: parseInt(rating),
        content,
        sentiment,
        confidence: Math.round(confidence * 100) / 100,
        topics: JSON.stringify(topics),
        keywords: JSON.stringify(keywords),
        source: source || 'manual',
        productName: productName || '',
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}

// DELETE /api/reviews
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Missing review id' }, { status: 400 });
    }

    await db.review.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
