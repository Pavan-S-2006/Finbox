import Fuse from 'fuse.js';
import { CATEGORY_KEYWORDS } from './categoryKeywords.js';

// Prepare Fuse instance
const fuseOptions = {
    includeScore: true,
    threshold: 0.3,
    keys: ['keywords']
};

const fuse = new Fuse(CATEGORY_KEYWORDS, fuseOptions);

const textToNumber = (text) => {
    const small = {
        'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
        'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
        'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
        'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19,
        'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50,
        'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90
    };

    const magnitude = {
        'hundred': 100,
        'thousand': 1000,
        'lakh': 100000,
        'crore': 10000000,
        'million': 1000000,
        'k': 1000
    };

    // Split by non-alphanumeric chars to isolate words, but keep numbers intact
    const words = text.toLowerCase().replace(/-/g, ' ').split(/[^a-z0-9.]+/);

    // Logic: Identify "chains" of number words.
    // e.g. "one hundred twenty" is a chain.
    // "iphone 15" -> "15" is a chain.
    // "from croma" -> breaks.

    const numbersFound = [];

    let currentChainTotal = 0;
    let currentGroup = 0;
    let inNumberChain = false;

    const commitChain = () => {
        if (inNumberChain) {
            numbersFound.push(currentChainTotal + currentGroup);
            currentChainTotal = 0;
            currentGroup = 0;
            inNumberChain = false;
        }
    };

    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (!word) continue;

        const val = small[word];
        const mag = magnitude[word];
        const numeric = parseFloat(word);

        const isNum = !isNaN(numeric);
        const isSmall = val !== undefined;
        const isMag = mag !== undefined;

        if (isNum || isSmall || isMag) {
            inNumberChain = true;

            if (isNum) {
                // If we get a raw number "500", it usually ends a group?
                // "two thousand 500" -> 2000 + 500.
                currentChainTotal += currentGroup;
                currentGroup = numeric;
            } else if (isSmall) {
                currentGroup += val;
            } else if (isMag) {
                const valBefore = currentGroup === 0 ? 1 : currentGroup;
                if (mag >= 1000) {
                    currentChainTotal += valBefore * mag;
                    currentGroup = 0;
                } else {
                    // hundred
                    currentGroup = valBefore * mag;
                }
            }
        } else {
            // Non-number word breaks the chain
            commitChain();
        }
    }
    commitChain(); // Commit valid chain at end

    // Filter out unlikely prices (e.g. years, small integers < 10 if likely quantity?)
    // For now, return max.
    if (numbersFound.length === 0) return 0;
    return Math.max(...numbersFound);
};

const normalizeText = (text) => {
    return text
        .toLowerCase()
        .replace(/rupees|rs\.?/g, "rs")
        .replace(/(\d+),(\d+)/g, '$1$2')
        .replace(/\b(spent|paid|received|income|bill|of|today|yesterday|approx|approximately)\b/g, "")
        .trim();
};

const extractAmount = (text) => {
    // 1. Try spoken words/numbers extraction logic
    const extractedValue = textToNumber(text);
    if (extractedValue > 0) return extractedValue;
    return 0;
};

const detectCategory = (text) => {
    const words = text.toLowerCase().split(/\s+/);
    let bestMatch = { category: "Other", score: 1 };

    for (const word of words) {
        if (word.length < 3) continue;

        const results = fuse.search(word);

        if (results.length > 0) {
            const match = results[0];
            if (match.score < bestMatch.score) {
                bestMatch = {
                    category: match.item.category,
                    score: match.score,
                    matchedKeyword: word
                };
            }
        }
    }

    if (bestMatch.score < 0.4) {
        return bestMatch;
    }

    return { category: "Other", score: 1 };
};

const extractDescription = (text, amount) => {
    let cleaned = text.toLowerCase();

    if (amount) {
        cleaned = cleaned.replace(amount.toString(), "");
    }

    cleaned = cleaned.replace(/rupees|rs\.?|₹/g, "");

    cleaned = cleaned
        .replace(/\b(spent|paid|received|income|bill|of|on|for|at|to|buy|bought|purchase|ordered)\b/g, "")
        .replace(/\s+/g, " ")
        .trim();

    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1) || "Voice Entry";
};

export const parseVoiceInput = (text) => {
    const normalizedText = normalizeText(text);
    const amount = extractAmount(text);
    const categoryResult = detectCategory(normalizedText);

    let type = 'expense';
    if (categoryResult.category === 'Income' ||
        normalizedText.includes('received') ||
        normalizedText.includes('credited')) {
        type = 'income';
    }

    const description = extractDescription(text, amount);

    return {
        type,
        amount,
        category: categoryResult.category,
        description: description || categoryResult.matchedKeyword || "Voice Entry",
        confidence: 1 - categoryResult.score
    };
};
