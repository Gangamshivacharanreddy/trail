import vision from '@google-cloud/vision';
import natural from 'natural';
import { createHash } from 'crypto';

const sentiment = new natural.SentimentAnalyzer();
const tokenizer = new natural.WordTokenizer();

export class ContentModerator {
  static async moderateImage(imageBuffer) {
    try {
      const client = new vision.ImageAnnotatorClient();
      const [result] = await client.safeSearchDetection(imageBuffer);
      const detections = result.safeSearchAnnotation;

      // Check if content is inappropriate
      const isInappropriate = 
        detections.adult === 'LIKELY' || 
        detections.adult === 'VERY_LIKELY' ||
        detections.violence === 'LIKELY' ||
        detections.violence === 'VERY_LIKELY';

      return {
        isAppropriate: !isInappropriate,
        details: detections
      };
    } catch (error) {
      console.error('Image moderation failed:', error);
      throw new Error('Content moderation failed');
    }
  }

  static moderateText(text) {
    // Tokenize and analyze sentiment
    const tokens = tokenizer.tokenize(text);
    const score = sentiment.getSentiment(tokens);

    // Check for inappropriate words (simplified example)
    const hasInappropriateWords = this.containsProfanity(text);

    return {
      isAppropriate: score > -0.25 && !hasInappropriateWords,
      sentimentScore: score
    };
  }

  static containsProfanity(text) {
    // Simplified profanity check - in production, use a comprehensive list
    const profanityList = ['badword1', 'badword2'];
    const words = text.toLowerCase().split(' ');
    return words.some(word => profanityList.includes(word));
  }
}