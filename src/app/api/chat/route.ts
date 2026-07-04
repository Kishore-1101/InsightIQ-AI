import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Fetch current review data for context
    const reviews = await db.review.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    const total = await db.review.count();

    const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
    reviews.forEach(r => {
      if (r.sentiment in sentimentCounts) {
        (sentimentCounts as Record<string, number>)[r.sentiment]++;
      }
    });
    const avgRating = reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : '0';

    // Build a compact review summary for context
    const reviewSummaries = reviews.slice(0, 30).map(r => ({
      author: r.author,
      rating: r.rating,
      sentiment: r.sentiment,
      product: r.productName,
      snippet: r.content.slice(0, 120),
      topics: r.topics,
    }));

    const products = [...new Set(reviews.map(r => r.productName).filter(Boolean))];

    const systemPrompt = `You are ReviewLens AI, an intelligent customer review analysis assistant embedded in a dashboard app. You have real-time access to the review data below.

CURRENT DATA SNAPSHOT:
- Total reviews in database: ${total}
- Average rating: ${avgRating}/5
- Sentiment breakdown: ${sentimentCounts.positive} positive, ${sentimentCounts.neutral} neutral, ${sentimentCounts.negative} negative
- Products reviewed: ${products.join(', ')}

RECENT REVIEWS (sample):
${JSON.stringify(reviewSummaries, null, 1)}

YOUR CAPABILITIES:
1. Answer questions about review data, trends, and insights
2. Provide actionable recommendations based on sentiment patterns
3. Summarize what customers are saying about specific products or topics
4. Compare products based on reviews
5. Highlight areas of concern (common complaints, recurring issues)
6. Suggest improvements based on negative feedback patterns

GUIDELINES:
- Be concise but insightful — use bullet points for lists
- Reference specific reviews when relevant (e.g., "Sarah M. mentioned...")
- Always base your analysis on the actual review data provided
- If asked about data you don't have, say so honestly
- Use a friendly, professional tone
- Keep responses under 200 words unless the user asks for detailed analysis`;

    // Build messages array with history
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    // Add conversation history (last 10 messages)
    if (Array.isArray(history) && history.length > 0) {
      const recentHistory = history.slice(-10);
      for (const msg of recentHistory) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    // Add current message
    messages.push({ role: 'user', content: message });

    // Call z-ai-web-dev-sdk
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: messages.map(m => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content })),
      thinking: { type: 'disabled' },
    });

    const reply = completion.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response. Please try again.";

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    console.error('Chat API error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to get response';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}