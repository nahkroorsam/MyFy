import type { Category, VoiceParsedResult } from '../types';

export const CATEGORIES: Category[] = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other'];

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: 'text-orange-400 border-orange-400/30 bg-orange-400/10',
  Transport: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
  Shopping: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
  Bills: 'text-red-400 border-red-400/30 bg-red-400/10',
  Entertainment: 'text-pink-400 border-pink-400/30 bg-pink-400/10',
  Other: 'text-obsidian-400 border-obsidian-400/30 bg-obsidian-400/10',
};

export const CATEGORY_DOTS: Record<Category, string> = {
  Food: 'bg-orange-400',
  Transport: 'bg-blue-400',
  Shopping: 'bg-purple-400',
  Bills: 'bg-red-400',
  Entertainment: 'bg-pink-400',
  Other: 'bg-obsidian-400',
};

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function parseVoiceInput(text: string): VoiceParsedResult {
  const lower = text.toLowerCase();

  // Match patterns like "forty dollars", "12.50", "hundred and twenty"
  const wordNumbers: Record<string, number> = {
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
    sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
    thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70,
    eighty: 80, ninety: 90, hundred: 100,
  };

  let amount: number | null = null;

  // Try numeric match first
  const numericMatch = lower.match(/(\d+(?:\.\d{1,2})?)/);
  if (numericMatch) {
    amount = parseFloat(numericMatch[1]);
  } else {
    // Try word number match
    let total = 0;
    const words = lower.split(/\s+/);
    for (const word of words) {
      if (wordNumbers[word] !== undefined) {
        if (word === 'hundred') {
          total = (total || 1) * 100;
        } else {
          total += wordNumbers[word];
        }
      }
    }
    if (total > 0) amount = total;
  }

  // Extract description — remove amount words and filler
  let description = text
    .replace(/\d+(?:\.\d{1,2})?/g, '')
    .replace(/\b(dollars?|bucks?|usd|for|on|spent|paid|bought|got|a|an|the|and)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!description) description = text.trim();

  return { amount, description };
}
