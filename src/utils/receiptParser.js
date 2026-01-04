
// Constants for Heuristic Rules
const AMOUNT_REGEX = /\b\d{2,6}(\.\d{2})?\b/g;
const IGNORE_WORDS = ['invoice', 'gst', 'phone', 'tel', 'fax', 'pin', 'date', 'thank', 'visit', 'qty', 'rate', 'item', 's.no', 'mr', 'mrs', 'dr', 'reg'];
const DATE_REGEX = /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/;
const PHONE_REGEX = /(\+91|0)?[6-9]\d{9}/;
const QTY_REGEX = /\b([xX]\s?\d+|\d+\s?pcs|\d+\s?nos)\b/;

// Merchant Category Mapping
const MERCHANT_CATEGORY = {
    "zomato": "Food",
    "swiggy": "Food",
    "uber": "Transport",
    "ola": "Transport",
    "rapido": "Transport",
    "amazon": "Shopping",
    "flipkart": "Shopping",
    "blinkit": "Food",
    "zepto": "Food",
    "dmart": "Food",
    "bigbasket": "Food",
    "myntra": "Shopping",
    "ajio": "Shopping",
    "starbucks": "Food",
    "mcdonald": "Food",
    "domino": "Food",
    "pizza": "Food",
    "kfc": "Food",
    "shell": "Transport",
    "hp": "Transport",
    "indian oil": "Transport",
    "bharat petroleum": "Transport",
    "apollo": "Health",
    "medplus": "Health",
    "pharmacy": "Health",
    "hospital": "Health",
    "clinic": "Health",
    "netmeds": "Health",
    "1mg": "Health",
    "bookmyshow": "Entertainment",
    "pvr": "Entertainment",
    "netflix": "Entertainment",
    "prime": "Entertainment",
    "bescom": "Utilities",
    "bwssb": "Utilities",
    "airtel": "Utilities",
    "jio": "Utilities",
    "vodafone": "Utilities",
    "act": "Utilities"
};

/**
 * 7-Step Receipt Parsing Pipeline
 * @param {Object} ocrData - { text: string, blocks: [], annotations: [] }
 * @returns {Object} { amount, category, description, date, confidence }
 */
export const parseReceipt = (ocrData) => {
    if (!ocrData || !ocrData.text) return { amount: 0, category: 'Other', description: 'Manual Verification Needed', confidence: 0 };

    const { text, blocks, annotations } = ocrData;
    const fullText = text.toLowerCase();

    // Quick pre-check: If blocks/annotations missing, fallback to simple regex
    if (!blocks || blocks.length === 0) {
        console.warn("Parsing Receipt: No bounding box data available, falling back to simple regex.");
        return simpleRegexParse(text);
    }

    const pageHeight = getPageDimensions(blocks).height;
    const avgFontSize = calculateAverageFontSize(blocks);

    // 1. Receipt Type Detection (Step 6 in pipeline, but useful early)
    const receiptType = detectReceiptType(fullText);

    // 2. Candidate Extraction & 3. Scoring (Step 2 in pipeline)
    // We extract all numeric candidates and score them
    const candidates = extractAmountCandidates(annotations, pageHeight, avgFontSize, fullText);

    // Select best amount
    candidates.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.y - a.y; // Tie-breaker: prefer bottom-most amount
    });
    const bestAmount = candidates.length > 0 ? candidates[0].amount : 0;
    const confidence = candidates.length > 0 ? candidates[0].confidence : 0;

    // 4. Merchant/Category Detection (Step 3)
    const categoryInfo = detectCategoryAndMerchant(annotations, fullText, getPageDimensions(blocks));

    // 5. Description Extraction (Step 4)
    const description = extractDescription(annotations, categoryInfo.merchant, bestAmount);

    // 6. Final Construction
    return {
        amount: bestAmount,
        category: categoryInfo.category,
        // If merchant found, use "Merchant - Description", else just Description
        description: categoryInfo.merchant ? `${categoryInfo.merchant} - ${description}` : description,
        date: extractDate(fullText),
        type: 'expense', // Default for receipts
        confidence: confidence
    };
};

// --- Helper Functions ---

const getPageDimensions = (blocks) => {
    // Estimate page dimensions from blocks if not explicitly provided
    let maxY = 0;
    let maxX = 0;
    blocks.forEach(block => {
        if (block.boundingBox?.vertices) {
            block.boundingBox.vertices.forEach(v => {
                if (v.y > maxY) maxY = v.y;
                if (v.x > maxX) maxX = v.x;
            });
        }
    });
    return { width: maxX, height: maxY || 1000 };
};

const calculateAverageFontSize = (blocks) => {
    let totalHeight = 0;
    let count = 0;
    blocks.forEach(block => {
        block.paragraphs?.forEach(p => {
            p.words?.forEach(w => {
                const box = w.boundingBox?.vertices;
                if (box && box.length === 4) {
                    const height = (box[2].y + box[3].y) / 2 - (box[0].y + box[1].y) / 2;
                    if (height > 0) {
                        totalHeight += height;
                        count++;
                    }
                }
            });
        });
    });
    return count > 0 ? totalHeight / count : 12; // Default 12px
};

const detectReceiptType = (text) => {
    if (/tax|table|gst|service charge/.test(text)) return 'Restaurant';
    if (/litre|petrol|diesel|nozzle|pump/.test(text)) return 'Fuel';
    if (/qty|kg|price|weight/.test(text)) return 'Grocery';
    if (/trip|ride|distance|km|fare/.test(text)) return 'Cab';
    return 'General';
};

const extractAmountCandidates = (annotations, pageHeight, avgFontSize, fullText) => {
    const candidates = [];

    // annotations[0] is full text, skip it. start from 1
    for (let i = 1; i < annotations.length; i++) {
        const item = annotations[i];
        const content = item.description;

        // Basic Numeric Filter
        // Allows: 123.45, 1,200.00
        // Rejects: Dates, Phone numbers (roughly)

        // Clean content: remove 'Rs', '$', commas
        const cleanContent = content.replace(/[₹$,]/g, '');
        const value = parseFloat(cleanContent);

        if (isNaN(value) || value <= 0) continue;
        if (!/\d{1,6}(\.\d{1,2})?$/.test(cleanContent)) continue; // strict localized check

        // Hard Filters
        if (value > 200000) continue; // Unlikely for daily receipts
        // Check if looks like date year
        if (value >= 2020 && value <= 2030 && !content.includes('.')) continue;

        // Bounding Box Data
        const box = item.boundingPoly?.vertices;
        if (!box) continue;

        const y = (box[0].y + box[2].y) / 2;
        const x = (box[0].x);
        const height = (box[2].y - box[0].y); // Font size approximation via box height

        // --- SCORING LOGIC ---
        let score = 0;

        // 1. Position: Total is usually at bottom
        if (y > pageHeight * 0.6) score += 2;
        if (y > pageHeight * 0.8) score += 2; // Extra boost for very bottom

        // 2. Keywords nearby (Need to look at previous/surrounding annotations)
        // This is expensive O(N^2), simplified: check current line or prev item
        // A better way is to check if *this* item is to the right of "Total"
        // For now, simpler heuristic:
        // Do we see "Total" in the full text? Yes.
        // We really need line grouping to check "Total ... 500". 
        // We'll rely on global position + visual attributes for now.

        // 3. Font Size
        if (height > avgFontSize * 1.2) score += 3; // Larger than avg

        // 4. Decimal presence
        if (content.includes('.')) score += 2; // Prices usually have decimals

        // 5. Currency Symbol nearby (in content itself due to google ocr grouping sometimes)
        if (item.description.includes('₹') || item.description.match(/rs/i)) score += 2;

        // 6. Keywords in the SAME line (approximate check)
        // Check if the text *containing* this number has keywords, or if previous item had keywords
        // Simple approximation: check full description of this item (often google groups "Total 500")
        if (/total|grand|amount|payable/i.test(content)) score += 4;
        if (/received|paid/i.test(content)) score += 3; // Boost for paid amount too

        // Check Previous Item (often key is separate from value)
        // Very rough check: does annotation[i-1] look like a key?
        if (i > 0) {
            const prev = annotations[i - 1].description;
            if (/total|grand|amount/i.test(prev)) score += 3;
            if (/received|paid/i.test(prev)) score += 3;
        }

        candidates.push({
            amount: value,
            score: score,
            confidence: 0.8 + (score * 0.05), // Fake confidence based on score
            y: y
        });
    }

    return candidates;
};

const detectCategoryAndMerchant = (annotations, fullText, pageDims) => {
    // 1. Merchant Detection
    // Merchant usually at top, centered/large. 
    // We look at the first 10-20 annotations.
    let possibleMerchant = "";
    let merchantCategory = "Other";

    // Sort by Y first, then X
    // Annotations are usually somewhat ordered but not guaranteed
    const sorted = [...annotations].slice(1).sort((a, b) => {
        const yA = a.boundingPoly?.vertices?.[0]?.y || 0;
        const yB = b.boundingPoly?.vertices?.[0]?.y || 0;
        return yA - yB;
    });

    const topItems = sorted.slice(0, 15); // Look at top 15 words

    // Attempt to reconstruction lines
    const lines = [];
    let currentLine = [];
    let lastY = -1;

    topItems.forEach(item => {
        const y = item.boundingPoly?.vertices?.[0]?.y || 0;
        if (lastY !== -1 && Math.abs(y - lastY) > 20) { // New line threshold
            lines.push(currentLine.join(" "));
            currentLine = [];
        }
        currentLine.push(item.description);
        lastY = y;
    });
    if (currentLine.length > 0) lines.push(currentLine.join(" "));

    // Match against DB
    for (const line of lines) {
        const cleanLine = line.toLowerCase();
        for (const [merchant, cat] of Object.entries(MERCHANT_CATEGORY)) {
            if (cleanLine.includes(merchant)) {
                return { merchant: merchant.charAt(0).toUpperCase() + merchant.slice(1), category: cat };
            }
        }
    }

    // If no known merchant, pick the largest text in top 15 items as merchant name
    if (!possibleMerchant) {
        let maxFontSize = 0;
        let bestCandidate = "";

        // Check only top items (already sorted/sliced)
        topItems.forEach(item => {
            const box = item.boundingPoly?.vertices;
            if (box) {
                const height = (box[2].y - box[0].y);
                // Ignore "Invoice", "Tax", etc.
                const text = item.description;
                if (height > maxFontSize && !/invoice|tax|date|gstin|phone|total|bill/i.test(text) && text.length > 2) {
                    maxFontSize = height;
                    bestCandidate = text;
                }
            }
        });

        // Try to construct full name if adjacent words are providing valid name
        // For simplicity, just use the single best candidate or try to look for its neighbors?
        // Let's just use the logic of "Largest line" from our line reconstruction earlier if possible.
        // Simplified: Just use the single largest word for now, or combine if multiple large words on same line.

        // Better: Check the LINES we constructed.
        let maxLineHeight = 0;
        for (const line of lines) {
            // Estimate line height by checking its first word in topItems (inefficient but works for small set)
            // simplified: assume lines are ordered.
            // Just take the first line that isn't "Tax Invoice" as merchant?
            if (!/invoice|tax|date|gstin/i.test(line) && line.length > 3) {
                possibleMerchant = line;
                // Simple first-valid-line heuristic is often best for Merchant Name
                break;
            }
        }
    }

    // Fallback Category Detection based on keywords in full text
    if (/food|restaurant|kitchen|dine|hotel|biryani|burger|pizza|apple|orange|banana|fruit|vegetable/.test(fullText)) merchantCategory = "Food";
    else if (/fuel|petrol|diesel/.test(fullText)) merchantCategory = "Transport";
    else if (/uber|ola|rapido|ride/.test(fullText)) merchantCategory = "Transport";
    else if (/grocer|supermarket|mart|store/.test(fullText)) merchantCategory = "Food"; // Groceries -> Food for now
    else if (/movie|cinema|theatre/.test(fullText)) merchantCategory = "Entertainment";

    return { merchant: possibleMerchant || null, category: merchantCategory };
};

const extractDescription = (annotations, merchantName, amount) => {
    // If merchant known, that's often enough: "Zomato", "Uber"
    // If we want item level: "Chicken Biryani"
    // Strategy: Look for the longest text line that DOES start with a number (qty) or price.
    // OR: Just find the biggest text bloc that isn't the merchant name or "Invoice".

    if (merchantName) return "Order"; // "Zomato - Order"
    return "Purchase";
};

const extractDate = (text) => {
    const match = text.match(DATE_REGEX);
    return match ? match[0] : new Date().toISOString().split('T')[0];
};

const simpleRegexParse = (text) => {
    // Fallback logic (similar to existing one in FinanceContext)
    const lines = text.split('\n');
    let amount = 0;

    const totalLine = lines.find(line => /total|amount|due|payable/i.test(line));
    if (totalLine) {
        const match = totalLine.match(/(\d+[.,]?\d*)/);
        if (match) amount = parseFloat(match[0].replace(/,/g, ''));
    }

    if (amount === 0) {
        const allNumbers = text.match(/\d+[.,]?\d*/g) || [];
        const validNumbers = allNumbers.map(n => parseFloat(n.replace(/,/g, '')))
            .filter(n => n < 200000 && !(n >= 2020 && n <= 2030));
        if (validNumbers.length > 0) amount = Math.max(...validNumbers);
    }

    return {
        amount,
        category: 'Other',
        description: 'Receipt Entry',
        date: new Date().toISOString().split('T')[0],
        confidence: 0.5
    };
};
