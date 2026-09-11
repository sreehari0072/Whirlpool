/**
 * Goat Roast Library & Dynamic Generator for baa-bye.com
 * Contains 50+ playful, hilarious, non-hateful roasts tailored to typing styles,
 * plus optional Gemini AI integration with 100% offline fallback.
 */

const GOAT_ROASTS = {
  // General roasts for standard inputs
  general: [
    "I ate your essay. It tasted like procrastination.",
    "That was a lot of words for absolutely no reason.",
    "You really thought those letters were safe? Cute.",
    "I've eaten fresh grass with more philosophical depth.",
    "You type like my grandma walks. Downhill. In snow.",
    "My four stomachs are offended by your syntax.",
    "Delicious. 10/10 crunch, 2/10 plot development.",
    "All those keystrokes, and not a single coherent point.",
    "I digest faster than you form thoughts.",
    "Did your keyboard owe you money, or why did you abuse it like that?",
    "Congratulations, your prose just became high-fiber cud.",
    "You write with the confidence of a goose crossing an interstate.",
    "I was expecting Shakespeare, but I got expired celery.",
    "Thanks for the snack! The consonants were particularly dry.",
    "Every letter you typed brought me closer to spiritual enlightenment and indigestion.",
    "That paragraph had the emotional weight of a wet paper towel.",
    "I’m a goat and even I think your vocabulary needs grazing.",
    "Was that your life story or did you fall asleep on the spacebar?",
    "Letters received. Letters shredded. Letters fermented into gas.",
    "Next time, try typing with your hooves. Might be faster.",
    "I give that text a solid 4 out of 10 tin cans.",
    "I’ve chewed through barbed wire with fewer sharp edges than that sentence."
  ],

  // For very short inputs (< 15 characters)
  short: [
    "That's it? That was barely an appetizer.",
    "My back molars didn't even touch that snippet.",
    "A toddler coughing makes more noise than whatever that was.",
    "Did your fingers get tired after five letters?",
    "I opened my mouth for THAT crumb?",
    "Give me an entree next time, coward.",
    "That was shorter than my attention span, and I'm a goat.",
    "Three words? What is this, a luxury tasting menu?"
  ],

  // For long inputs (> 120 characters)
  long: [
    "Did you write a whole novel just to feed a cartoon ruminant?",
    "War and Peace had fewer characters than whatever you just dumped here.",
    "My gastrointestinal tract is now 90% thesis statement.",
    "I feel heavy. That was the encyclopedia of bad decisions.",
    "I’m not a shredder, I’m a goat! ...Okay, fine, I’m a shredder.",
    "Who hurt you, and why did you make me eat the transcript?",
    "That was so long my left horn went numb halfway through.",
    "I ate so many words I think I accidentally absorbed a law degree."
  ],

  // For keyboard mash or gibberish (e.g. asdfghjkl, repeated characters)
  mash: [
    "Did a cat walk across your keyboard, or was that your genuine masterpiece?",
    "Asdfghjkl is not a recognized culinary food group, even for goats.",
    "Nice keyboard mashing. Did your elbow slip?",
    "I eat tin cans, shoes, and tires, but even I draw the line at pure keysmash.",
    "If that was a secret code, the FBI is very confused right now.",
    "Smashing random keys won't save your letters from my digestive juices!"
  ],

  // For all-caps (SHOUTING)
  loud: [
    "WHY ARE WE SHOUTING? MY EARS ARE RINGING!",
    "All caps? Were those letters spicy on purpose?",
    "Loud letters taste like static electricity.",
    "You screamed in text and I chewed in lowercase. Balance restored."
  ],

  // If user mentioned grass, food, or eating
  food: [
    "You mentioned food, but forgot the clover!",
    "Paper letters are okay, but real Bermuda grass hits different.",
    "If you want to impress me, type a bushel of alfalfa next time."
  ],

  // If user insulted or questioned the goat
  meta: [
    "You're testing me? I'm programmed to be hungry. You cannot win.",
    "The domain is Goatlife.com for a reason. This is the goat life!",
    "You fed me. I burped. The circle of life is complete."
  ]
};

class RoastEngine {
  constructor() {
    this.geminiApiKey = localStorage.getItem('goatlife_gemini_api_key') || '';
  }

  setApiKey(key) {
    this.geminiApiKey = (key || '').trim();
    if (this.geminiApiKey) {
      localStorage.setItem('goatlife_gemini_api_key', this.geminiApiKey);
    } else {
      localStorage.removeItem('goatlife_gemini_api_key');
    }
  }

  hasApiKey() {
    return !!this.geminiApiKey;
  }

  /**
   * Generates a context-aware roast based on the eaten text
   * @param {string} eatenText - The raw text that the goat consumed
   * @param {number} totalCount - Total characters eaten
   * @returns {Promise<string>}
   */
  async getRoast(eatenText, totalCount) {
    // Try Gemini API first if key configured
    if (this.geminiApiKey) {
      try {
        const aiRoast = await this.fetchAiRoast(eatenText, totalCount);
        if (aiRoast) return aiRoast;
      } catch (err) {
        console.warn('AI Roast error, using offline library fallback:', err);
      }
    }

    // Smart Offline Heuristics
    return this.getLocalRoast(eatenText, totalCount);
  }

  /**
   * Picks the smartest offline roast based on text metrics
   */
  getLocalRoast(text, count) {
    const trimmed = (text || '').trim();
    const upperRatio = trimmed.length > 5 ? (trimmed.match(/[A-Z]/g) || []).length / trimmed.length : 0;
    const lower = trimmed.toLowerCase();

    // Check for specific patterns
    if (lower.includes('grass') || lower.includes('clover') || lower.includes('food')) {
      return this.pickRandom(GOAT_ROASTS.food);
    }

    if (lower.includes('goat') || lower.includes('baa') || lower.includes('website') || lower.includes('useless')) {
      return this.pickRandom(GOAT_ROASTS.meta);
    }

    if (upperRatio > 0.65 && trimmed.length > 6) {
      return this.pickRandom(GOAT_ROASTS.loud);
    }

    // Check for keysmash (high consonant ratio or repetitive substrings)
    const isKeysmash = /^[asdfghjklqwertyuiopzxcvbnm]{8,}$/i.test(trimmed) || /(.)\1{3,}/.test(trimmed);
    if (isKeysmash) {
      return this.pickRandom(GOAT_ROASTS.mash);
    }

    if (count < 15) {
      return this.pickRandom(GOAT_ROASTS.short);
    }

    if (count > 90) {
      return this.pickRandom(GOAT_ROASTS.long);
    }

    return this.pickRandom(GOAT_ROASTS.general);
  }

  pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * Calls Google Gemini API if user optionally provides a key
   */
  async fetchAiRoast(eatenText, count) {
    const prompt = `You are a sarcastic, slightly derpy, playful cartoon goat on a comedic website called Goatlife.com.
A human user just typed ${count} characters into the website, and you literally ate them.
The eaten text was: "${eatenText.slice(-150)}"
Write a single short, hilarious, punchy, playful roast about what they typed or how they typed it.
Rules:
- Keep it under 25 words.
- Tone: Silly, farm-animal arrogance, playful sarcasm, non-hateful.
- Mention eating letters, digestion, grass, horns, or typing skills.
- Return ONLY the roast string, no quotes or intro.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 60
        }
      })
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    const result = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return result || null;
  }
}

// Export singleton
window.roastEngine = new RoastEngine();
