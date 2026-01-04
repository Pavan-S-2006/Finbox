
import { wordsToNumbers } from 'words-to-numbers';

const texts = [
    "Paid three hundred for macdonalds burger",
    "Bought a new iphone 15 from croma for 80000",
    "Cab to airport 500",
    "Paid electricity bill of 1200",
    "Received salary of 50000",
    "Bought vegetables for 200",
    "Subscription for netflix 649"
];

console.log("Debugging Amount Extraction...\n");

texts.forEach(text => {
    const converted = wordsToNumbers(text, { fuzzy: false });
    console.log(`Original: "${text}"`);
    console.log(`Converted: "${converted}"`);

    const matches = converted.toString().match(/\d+(?:\.\d+)?/g);
    console.log("Matches:", matches);
    console.log("-".repeat(20));
});
