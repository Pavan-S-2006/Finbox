
export const CATEGORY_KEYWORDS = [
    // --- FOOD & DRINK ---
    {
        category: "Food",
        keywords: [
            // General
            "food", "foodie", "meal", "breakfast", "lunch", "dinner", "snack", "brunch", "supper", "feast", "hungry", "eat", "eating", "drank", "drink", "beverage",
            // Fast Food Brands
            "mcdonalds", "macdonald", "burger king", "kfc", "dominos", "pizza hut", "subway", "starbucks", "dunkin", "taco bell", "wendys",
            // Delivery Apps
            "swiggy", "zomato", "ubereats", "doordash", "grubhub", "blinkit", "zepto", "instamart", "bigbasket",
            // Cuisines/Dishes
            "pizza", "burger", "sandwich", "pasta", "sushi", "noodles", "rice", "curry", "roti", "naan", "biryani", "dosa", "idli", "samosa", "chai", "coffee", "tea", "cake", "ice cream", "dessert", "chocolate", "salad", "soup", "steak", "fries",
            // Venues
            "restaurant", "cafe", "bistro", "bar", "pub", "bakery", "diner", "mess", "canteen"
        ]
    },
    {
        category: "Groceries",
        parent: "Food", // Optional hierarchy if needed later
        keywords: [
            "grocery", "groceries", "supermarket", "mart", "vegetables", "fruits", "milk", "bread", "eggs", "meat", "chicken", "fish", "spices", "oil", "sugar", "salt", "wheat", "flour", "dal", "household items", "kirana"
        ]
    },

    // --- TRANSPORT ---
    {
        category: "Transport",
        keywords: [
            // Modes
            "transport", "transporation", "travel", "commute", "trip", "journey", "ride",
            // Vehicles/Services
            "cab", "taxi", "uber", "ola", "rapido", "lyft", "blablacar", "indriver", "rickshaw", "auto", "tuk tuk",
            // Public Transport
            "bus", "train", "metro", "subway", "tram", "ticket", "pass", "flight", "plane", "airline", "airport", "railway", "irctc",
            // Fuel
            "fuel", "petrol", "diesel", "gas", "cng", "shell", "hp", "bharat petroleum", "indian oil", "pump", "tank"
        ]
    },

    // --- UTILITIES ---
    {
        category: "Utilities",
        keywords: [
            // General
            "utility", "utilities", "bill", "bills", "recharge", "topup",
            // Specifics
            "electricity", "power", "current", "bescom", "tata power", "adani power",
            "water", "sewage", "gas cylinder", "lpg", "indane", "hp gas",
            "internet", "wifi", "broadband", "fiber", "act", "jio fiber", "airtel xtream",
            "mobile", "phone", "prepaid", "postpaid", "jio", "airtel", "vi", "vodafone", "bsnl", "data pack"
        ]
    },

    // --- SHOPPING ---
    {
        category: "Shopping",
        keywords: [
            // General
            "shopping", "shop", "bought", "buy", "purchase", "order", "ordered",
            // Platforms/Venues
            "amazon", "flipkart", "myntra", "ajio", "meesho", "nykaa", "tatacliq", "mall", "market", "bazaar", "store",
            // Clothing
            "clothes", "clothing", "dress", "shirt", "t-shirt", "jeans", "pants", "trousers", "jacket", "coat", "shoes", "sneakers", "sandals", "boots", "socks", "underwear", "fashion", "accessories",
            // Electronics
            "electronics", "gadget", "mobile", "phone", "smartphone", "iphone", "samsung", "laptop", "computer", "macbook", "tablet", "ipad", "camera", "headphones", "earbuds", "watch", "smartwatch",
            // Home & Decor
            "furniture", "decor", "home", "kitchenware", "appliance"
        ]
    },

    // --- ENTERTAINMENT ---
    {
        category: "Entertainment",
        keywords: [
            // General
            "entertainment", "fun", "enjoy", "party", "celebration",
            // Movies/Shows
            "movie", "cinema", "film", "theater", "show", "imax", "pvr", "inox", "bookmyshow",
            // Subscriptions
            "subscription", "netflix", "prime video", "disney", "hotstar", "hulu", "hbo", "spotify", "apple music", "youtube premium",
            // Gaming
            "game", "gaming", "steam", "playstation", "xbox", "nintendo", "console", "video game",
            // Activities
            "concert", "gig", "event", "club", "park", "amusement"
        ]
    },

    // --- HEALTH ---
    {
        category: "Health",
        keywords: [
            // General
            "health", "medical", "healthcare",
            // Services
            "doctor", "hospital", "clinic", "consultation", "checkup", "test", "scan", "x-ray", "mri", "blood test", "dentist", "therapy",
            // Products
            "medicine", "meds", "pills", "tablets", "pharmacy", "chemist", "drugstore", "1mg", "pharmeasy", "apollo",
            // Fitness
            "gym", "fitness", "yoga", "workout", "protein", "supplements", "cult"
        ]
    },

    // --- EDUCATION ---
    {
        category: "Education",
        keywords: [
            "education", "school", "college", "university", "tuition", "coaching", "fees", "fee", "course", "class", "training", "workshop", "certification", "udemy", "coursera", "books", "stationery", "pen", "paper", "notebook"
        ]
    },

    // --- INCOME ---
    {
        category: "Income", // Special handling for type
        keywords: [
            "income", "earnings", "salary", "wage", "wages", "paycheck", "payment received", "credited",
            "freelance", "contract", "gig work", "upwork", "fiverr",
            "bonus", "incentive", "allowance", "stipend",
            "gift", "cash gift",
            "interest", "dividend", "profit", "return"
        ]
    },

    // --- INVESTMENTS ---
    {
        category: "Investments",
        keywords: [
            "invest", "investment", "invested", "stocks", "shares", "mutual fund", "sip", "bonds", "gold", "silver", "crypto", "bitcoin", "ethereum", "zerodha", "groww", "upstox", "indmoney", "fd", "fixed deposit", "rd"
        ]
    }
];
