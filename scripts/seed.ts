import { db } from '../src/lib/db';
import { v4 as uuidv4 } from 'uuid';

const sampleReviews = [
  { author: "Sarah M.", rating: 5, content: "Absolutely love this product! The build quality is outstanding and it exceeded all my expectations. Customer service was also incredibly helpful when I had questions about setup.", productName: "WirelessPro Headphones" },
  { author: "James K.", rating: 4, content: "Great product overall. The sound quality is excellent and the battery life is impressive. Only minor complaint is that the carrying case could be a bit more sturdy.", productName: "WirelessPro Headphones" },
  { author: "Emily R.", rating: 2, content: "Disappointed with the purchase. The product stopped working after just two weeks. The warranty process was frustrating and took forever to get a replacement.", productName: "WirelessPro Headphones" },
  { author: "Michael T.", rating: 5, content: "Best headphones I've ever owned. The noise cancellation is top-notch, perfect for my daily commute. Comfortable for extended wear sessions.", productName: "WirelessPro Headphones" },
  { author: "Lisa P.", rating: 3, content: "Average product for the price. Sound is decent but not groundbreaking. The Bluetooth connectivity drops occasionally which is annoying during calls.", productName: "WirelessPro Headphones" },
  { author: "David W.", rating: 1, content: "Terrible experience. The left earbud stopped producing sound within a month. Customer support was unresponsive for days. Would not recommend.", productName: "WirelessPro Headphones" },
  { author: "Anna L.", rating: 4, content: "Really good value for money. The design is sleek and modern. Wish it came with more ear tip sizes though. Overall satisfied with my purchase.", productName: "WirelessPro Headphones" },
  { author: "Robert H.", rating: 5, content: "Outstanding audio quality! I'm an audiophile and these headphones deliver crystal clear sound across all frequencies. The bass response is particularly impressive.", productName: "WirelessPro Headphones" },
  { author: "Jennifer C.", rating: 3, content: "Good but not great. The noise cancellation works well in quiet environments but struggles with loud offices. Comfort is decent for short periods.", productName: "WirelessPro Headphones" },
  { author: "Chris B.", rating: 4, content: "Solid headphones with great battery life. I get about 30 hours on a single charge. The quick charge feature is a lifesaver when I forget to charge overnight.", productName: "WirelessPro Headphones" },
  { author: "Amanda S.", rating: 5, content: "The smartwatch has transformed my daily routine. Fitness tracking is incredibly accurate and the sleep monitoring helped me improve my sleep habits significantly.", productName: "FitBand Ultra" },
  { author: "Kevin D.", rating: 4, content: "Love the design and the always-on display. The app integration with both iOS and Android is seamless. Battery could be better - needs daily charging.", productName: "FitBand Ultra" },
  { author: "Rachel G.", rating: 2, content: "The watch is beautiful but the software is buggy. It often loses connection with my phone and the step counter is wildly inaccurate compared to my pedometer.", productName: "FitBand Ultra" },
  { author: "Tom F.", rating: 5, content: "This smartwatch is a game changer! The health monitoring features are comprehensive. Blood oxygen and heart rate monitoring are hospital-grade accurate.", productName: "FitBand Ultra" },
  { author: "Maria V.", rating: 3, content: "Decent smartwatch for the price. The interface can be laggy sometimes and the app store is limited. Good for basic fitness tracking but don't expect smartwatch features.", productName: "FitBand Ultra" },
  { author: "Steven J.", rating: 1, content: "Screen cracked within a week of normal use. The build quality is poor for a device at this price point. Very disappointed and would not buy again.", productName: "FitBand Ultra" },
  { author: "Nicole W.", rating: 4, content: "Really impressed with the waterproofing. I swim with it daily and it works perfectly. The GPS accuracy for running is excellent too. Highly recommend for athletes.", productName: "FitBand Ultra" },
  { author: "Brian M.", rating: 5, content: "The perfect smartwatch! Elegant design that works for both casual and formal settings. The notification system is smart - only alerts you for important things.", productName: "FitBand Ultra" },
  { author: "Diana L.", rating: 4, content: "Great battery life improvement from previous version. The new workout modes are fantastic. Only wish the screen was brighter in direct sunlight.", productName: "FitBand Ultra" },
  { author: "Patrick R.", rating: 3, content: "It's okay. The setup process was complicated and the manual is poorly written. Once running it works fine but the initial experience left a bad taste.", productName: "FitBand Ultra" },
  { author: "Olivia H.", rating: 5, content: "This coffee maker is absolutely phenomenal! The brew quality rivals my favorite coffee shop. Programmable features make my mornings so much easier.", productName: "BrewMaster Elite" },
  { author: "Nathan C.", rating: 4, content: "Excellent coffee maker with consistent results. The thermal carafe keeps coffee hot for hours. Would love a larger water reservoir for fewer refills.", productName: "BrewMaster Elite" },
  { author: "Sophie T.", rating: 2, content: "The machine leaked water everywhere on the second day. The build quality feels cheap despite the high price tag. Returning it for a refund.", productName: "BrewMaster Elite" },
  { author: "Mark A.", rating: 5, content: "Barista-quality coffee at home! The milk frother attachment is a wonderful bonus. Easy to clean and maintain. Best kitchen purchase this year.", productName: "BrewMaster Elite" },
  { author: "Laura E.", rating: 3, content: "Makes decent coffee but the grinding mechanism is very noisy. Also takes longer than expected to brew a full pot. The timer feature is handy though.", productName: "BrewMaster Elite" },
  { author: "Jason P.", rating: 1, content: "Worst coffee maker I've owned. The heating element failed after two months. Customer service was rude and unhelpful. Complete waste of money.", productName: "BrewMaster Elite" },
  { author: "Michelle K.", rating: 4, content: "Love the sleek design and the variety of brew strengths. The reusable filter is eco-friendly and easy to clean. Makes a perfect cup every time.", productName: "BrewMaster Elite" },
  { author: "William S.", rating: 5, content: "Upgraded from a basic drip machine and the difference is night and day. The temperature control ensures optimal extraction. My coffee snob friends are impressed!", productName: "BrewMaster Elite" },
  { author: "Helen B.", rating: 4, content: "Very good coffee maker with thoughtful design touches. The auto-shutoff feature gives peace of mind. Would appreciate a larger capacity option.", productName: "BrewMaster Elite" },
  { author: "Alex N.", rating: 3, content: "The coffee quality is good but not exceptional for the price. The display is hard to read in low light. Cleaning is straightforward at least.", productName: "BrewMaster Elite" },
  { author: "Christine Z.", rating: 5, content: "This laptop is blazing fast! The processor handles everything I throw at it - video editing, 3D rendering, and gaming. The display is stunning with perfect color accuracy.", productName: "ProBook X15" },
  { author: "Derek L.", rating: 4, content: "Excellent performance and build quality. The keyboard is one of the best I've used on a laptop. Battery life is around 8 hours which is solid for this specs.", productName: "ProBook X15" },
  { author: "Kelly R.", rating: 2, content: "The laptop overheats during extended use. The fan noise is distracting in quiet environments. Also the trackpad is unreliable - sometimes doesn't register clicks.", productName: "ProBook X15" },
  { author: "Ryan M.", rating: 5, content: "Perfect for software development. The large screen real estate and powerful CPU compile code in seconds. The Unix-based terminal is a dream to work with.", productName: "ProBook X15" },
  { author: "Jessica F.", rating: 3, content: "Good laptop but overpriced for what you get. The webcam quality is poor for video calls. The included charger is bulky. Performance is adequate for office work.", productName: "ProBook X15" },
  { author: "Thomas W.", rating: 1, content: "Received a defective unit with a dead pixel cluster. The replacement process was a nightmare - took three weeks. The quality control is clearly lacking.", productName: "ProBook X15" },
  { author: "Samantha D.", rating: 4, content: "Beautiful display with thin bezels. The speakers are surprisingly good for a laptop. Face recognition login works flawlessly every time. Very pleased overall.", productName: "ProBook X15" },
  { author: "Brandon K.", rating: 5, content: "This laptop handles my heavy data science workloads with ease. 32GB RAM is plenty and the SSD is lightning fast. Best work laptop I've ever used.", productName: "ProBook X15" },
  { author: "Ashley P.", rating: 4, content: "Great performance in a portable package. The weight is manageable for commuting. Only downside is the limited port selection - had to buy adapters.", productName: "ProBook X15" },
  { author: "Greg T.", rating: 3, content: "Decent laptop but the software has bugs. Frequent Bluetooth disconnections and occasional screen flickering. Hardware is good but the software needs work.", productName: "ProBook X15" },
  { author: "Monica S.", rating: 5, content: "The vacuum cleaner is incredible! Suction power is unmatched and it automatically adjusts to different floor types. The self-emptying base is a game changer for pet owners.", productName: "CleanBot Max" },
  { author: "Frank G.", rating: 4, content: "Very effective robot vacuum with excellent mapping technology. It navigates around furniture beautifully. The app control is intuitive and scheduling is easy.", productName: "CleanBot Max" },
  { author: "Irene Y.", rating: 2, content: "Gets stuck frequently on rugs and doesn't handle transitions between floor types well. The cleaning pattern is chaotic and misses spots. Returned it.", productName: "CleanBot Max" },
  { author: "Paul H.", rating: 5, content: "Best robot vacuum we've owned. It handles pet hair like a champ and the mopping function actually works well. Quiet enough to run while watching TV.", productName: "CleanBot Max" },
  { author: "Debbie C.", rating: 3, content: "Cleans well on hard floors but struggles on medium-pile carpet. The bin is small and needs frequent emptying. The filter replacement cost adds up over time.", productName: "CleanBot Max" },
  { author: "Raymond J.", rating: 1, content: "Stopped working after three months. The warranty doesn't cover what they call 'normal wear'. Customer service was condescending. Total waste of money.", productName: "CleanBot Max" },
  { author: "Carol A.", rating: 4, content: "Love how it integrates with our smart home system. Voice control through Alexa works perfectly. The multi-floor mapping remembers different floor plans.", productName: "CleanBot Max" },
  { author: "Jeff O.", rating: 5, content: "This thing is a beast! Picks up everything from fine dust to large debris. The obstacle avoidance is impressive - never damaged any furniture. Highly recommend!", productName: "CleanBot Max" },
  { author: "Stephanie M.", rating: 4, content: "Great cleaning performance and the self-cleaning feature is wonderful. The noise level is acceptable. Would love to see a longer battery life in the next version.", productName: "CleanBot Max" },
  { author: "Victor L.", rating: 3, content: "It works as advertised but the setup was frustrating. The app kept crashing during the initial mapping process. Once set up, it cleans reliably though.", productName: "CleanBot Max" },
];

function analyzeSentimentLocal(text: string, rating: number): { sentiment: string; confidence: number } {
  const positiveWords = ['love', 'excellent', 'outstanding', 'great', 'perfect', 'best', 'amazing', 'incredible', 'fantastic', 'wonderful', 'impressive', 'beautiful', 'phenomenal', 'blazing', 'solid', 'highly recommend', 'satisfied', 'champion', 'flawless', 'lightning', 'game changer', 'rivals', 'pleased', 'enjoy', 'smooth'];
  const negativeWords = ['terrible', 'worst', 'disappointed', 'poor', 'defective', 'buggy', 'stopped', 'failed', 'frustrating', 'unresponsive', 'noisy', 'overpriced', 'waste', 'broken', 'struggles', 'lacking', 'unreliable', 'chaotic', 'stuck', 'leaked', 'cracked', 'dead', 'laggy', 'rude', 'condescending', 'nightmare', 'ugly', 'hate', 'awful', 'useless'];
  
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

function extractTopics(text: string): string[] {
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

function extractKeywords(text: string): string[] {
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'and', 'but', 'or', 'nor', 'not', 'so', 'yet', 'both', 'either', 'neither', 'each', 'every', 'all', 'any', 'few', 'more', 'most', 'other', 'some', 'such', 'only', 'own', 'same', 'than', 'too', 'very', 'just', 'because', 'when', 'where', 'how', 'what', 'which', 'who', 'this', 'that', 'these', 'those', 'also', 'about', 'even', 'well', 'still', 'much', 'that', 'from', 'like', 'work', 'works', 'working']);
  
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

async function seed() {
  console.log('Seeding database with sample reviews...');
  
  for (const review of sampleReviews) {
    const { sentiment, confidence } = analyzeSentimentLocal(review.content, review.rating);
    const topics = extractTopics(review.content);
    const keywords = extractKeywords(review.content);
    
    await db.review.create({
      data: {
        id: uuidv4(),
        author: review.author,
        rating: review.rating,
        content: review.content,
        sentiment,
        confidence: Math.round(confidence * 100) / 100,
        topics: JSON.stringify(topics),
        keywords: JSON.stringify(keywords),
        source: 'manual',
        productName: review.productName,
      }
    });
  }
  
  console.log(`Seeded ${sampleReviews.length} reviews successfully!`);
}

seed()
  .catch(console.error)
  .finally(() => process.exit(0));