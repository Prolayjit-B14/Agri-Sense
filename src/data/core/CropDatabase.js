
// ─── INDUSTRIAL CROP AGRONOMY DATABASE ──────────────────────────────────────
// Consolidated from research data, pest.csv, and fertilizer-composite.csv
// Version: 17.5.0 - Full Segment Consistency (No Fallbacks)

export const CROP_SPECS = {
    'rice': { n: [80, 100], p: [40, 60], k: [40, 60], ph: [5.5, 6.5], rain: [1200, 2500], hum: [80, 85], temp: [20, 27], type: 'Grain' },
    'wheat': { n: [100, 120], p: [40, 60], k: [40, 60], ph: [6.0, 7.5], rain: [600, 800], hum: [50, 70], temp: [15, 25], type: 'Grain' },
    'maize (corn)': { n: [100, 120], p: [50, 70], k: [40, 60], ph: [5.5, 7.0], rain: [500, 800], hum: [60, 80], temp: [18, 27], type: 'Grain' },
    'barley': { n: [60, 90], p: [30, 40], k: [30, 40], ph: [6.0, 8.0], rain: [400, 600], hum: [40, 60], temp: [12, 22], type: 'Grain' },
    'bajra': { n: [40, 60], p: [20, 30], k: [10, 20], ph: [6.5, 8.5], rain: [400, 600], hum: [40, 60], temp: [25, 35], type: 'Grain' },
    'jowar': { n: [80, 100], p: [40, 50], k: [20, 30], ph: [6.0, 8.0], rain: [450, 750], hum: [40, 60], temp: [25, 32], type: 'Grain' },
    'ragi': { n: [40, 60], p: [30, 40], k: [20, 30], ph: [4.5, 7.5], rain: [500, 1000], hum: [50, 80], temp: [20, 30], type: 'Grain' },
    'arhar/tur': { n: [20, 40], p: [40, 60], k: [20, 30], ph: [6.5, 7.5], rain: [600, 1000], hum: [60, 70], temp: [20, 30], type: 'Pulse' },
    'gram/chana': { n: [20, 30], p: [40, 60], k: [20, 30], ph: [6.0, 7.5], rain: [400, 600], hum: [50, 60], temp: [15, 25], type: 'Pulse' },
    'moong': { n: [20, 30], p: [40, 50], k: [20, 30], ph: [6.5, 7.5], rain: [600, 800], hum: [60, 75], temp: [25, 35], type: 'Pulse' },
    'urad': { n: [20, 30], p: [40, 50], k: [20, 30], ph: [6.5, 7.5], rain: [600, 1000], hum: [60, 80], temp: [25, 35], type: 'Pulse' },
    'masoor': { n: [20, 30], p: [40, 50], k: [20, 30], ph: [6.0, 7.5], rain: [300, 500], hum: [50, 60], temp: [15, 25], type: 'Pulse' },
    'kidneybeans': { n: [20, 30], p: [40, 60], k: [20, 30], ph: [5.5, 6.5], rain: [600, 1000], hum: [60, 80], temp: [15, 25], type: 'Pulse' },
    'mothbeans': { n: [20, 30], p: [40, 50], k: [20, 30], ph: [6.5, 7.5], rain: [300, 500], hum: [40, 60], temp: [25, 35], type: 'Pulse' },
    'sugarcane': { n: [200, 250], p: [80, 100], k: [120, 150], ph: [6.5, 7.5], rain: [1500, 2500], hum: [70, 85], temp: [25, 35], type: 'Cash Crop' },
    'cotton': { n: [100, 120], p: [50, 60], k: [40, 50], ph: [6.0, 7.5], rain: [500, 1000], hum: [50, 70], temp: [25, 35], type: 'Fiber' },
    'jute': { n: [60, 80], p: [40, 50], k: [60, 80], ph: [6.0, 7.5], rain: [1500, 2000], hum: [70, 90], temp: [25, 35], type: 'Fiber' },
    'coffee': { n: [100, 150], p: [40, 60], k: [150, 200], ph: [5.0, 6.0], rain: [1500, 2500], hum: [70, 85], temp: [15, 25], type: 'Cash Crop' },
    'groundnut (peanut)': { n: [20, 40], p: [40, 60], k: [30, 50], ph: [6.0, 7.5], rain: [500, 1000], hum: [50, 70], temp: [25, 35], type: 'Oilseed' },
    'mustard': { n: [80, 100], p: [40, 60], k: [40, 60], ph: [6.0, 7.5], rain: [400, 600], hum: [40, 60], temp: [15, 25], type: 'Oilseed' },
    'soybean': { n: [20, 40], p: [60, 80], k: [40, 60], ph: [6.0, 7.5], rain: [600, 1000], hum: [60, 80], temp: [20, 30], type: 'Oilseed' },
    'sunflower': { n: [60, 80], p: [40, 60], k: [30, 40], ph: [6.0, 7.5], rain: [500, 800], hum: [40, 60], temp: [20, 30], type: 'Oilseed' },
    'potato': { n: [120, 150], p: [80, 100], k: [150, 200], ph: [5.5, 6.5], rain: [500, 700], hum: [70, 90], temp: [15, 25], type: 'Vegetable' },
    'tomato': { n: [100, 120], p: [60, 80], k: [80, 100], ph: [6.0, 7.0], rain: [600, 800], hum: [60, 80], temp: [20, 30], type: 'Vegetable' },
    'onion': { n: [100, 120], p: [50, 60], k: [80, 100], ph: [6.0, 7.0], rain: [600, 800], hum: [60, 75], temp: [15, 30], type: 'Vegetable' },
    'brinjal (eggplant)': { n: [100, 120], p: [60, 80], k: [40, 60], ph: [5.5, 6.5], rain: [600, 1000], hum: [60, 70], temp: [20, 30], type: 'Vegetable' },
    'cabbage': { n: [120, 150], p: [60, 100], k: [100, 120], ph: [6.0, 6.8], rain: [500, 600], hum: [60, 90], temp: [15, 21], type: 'Vegetable' },
    'cauliflower': { n: [100, 120], p: [60, 80], k: [80, 100], ph: [6.0, 7.0], rain: [500, 700], hum: [60, 75], temp: [15, 25], type: 'Vegetable' },
    'spinach': { n: [80, 100], p: [40, 50], k: [60, 80], ph: [6.0, 7.0], rain: [400, 600], hum: [60, 70], temp: [15, 25], type: 'Vegetable' },
    'okra (ladyfinger)': { n: [80, 100], p: [50, 70], k: [50, 70], ph: [6.0, 6.8], rain: [800, 1200], hum: [60, 75], temp: [20, 35], type: 'Vegetable' },
    'carrot': { n: [60, 80], p: [40, 60], k: [100, 120], ph: [6.0, 7.0], rain: [400, 600], hum: [60, 70], temp: [15, 20], type: 'Vegetable' },
    'radish': { n: [50, 70], p: [30, 50], k: [50, 70], ph: [6.0, 7.0], rain: [300, 500], hum: [60, 70], temp: [10, 25], type: 'Vegetable' },
    'peas': { n: [20, 40], p: [50, 70], k: [40, 60], ph: [6.0, 7.5], rain: [400, 600], hum: [60, 70], temp: [10, 20], type: 'Vegetable' },
    'capsicum (bell pepper)': { n: [100, 120], p: [60, 80], k: [60, 80], ph: [6.0, 7.0], rain: [600, 1000], hum: [60, 75], temp: [20, 30], type: 'Vegetable' },
    'chili': { n: [100, 120], p: [60, 80], k: [60, 80], ph: [6.0, 7.0], rain: [800, 1200], hum: [60, 70], temp: [20, 30], type: 'Vegetable' },
    'pumpkin': { n: [60, 80], p: [40, 60], k: [80, 100], ph: [5.5, 6.5], rain: [500, 800], hum: [60, 75], temp: [25, 35], type: 'Vegetable' },
    'bottle gourd (lauki)': { n: [40, 60], p: [30, 40], k: [30, 40], ph: [6.0, 7.0], rain: [500, 800], hum: [60, 70], temp: [25, 35], type: 'Vegetable' },
    'bitter gourd (karela)': { n: [40, 60], p: [30, 40], k: [30, 40], ph: [6.0, 7.0], rain: [500, 800], hum: [60, 70], temp: [25, 35], type: 'Vegetable' },
    'cucumber': { n: [60, 80], p: [40, 60], k: [80, 100], ph: [5.5, 6.5], rain: [500, 800], hum: [60, 80], temp: [25, 35], type: 'Vegetable' },
    'beans': { n: [20, 40], p: [60, 80], k: [40, 60], ph: [6.0, 7.5], rain: [600, 800], hum: [60, 75], temp: [20, 30], type: 'Vegetable' },
    'mango': { n: [60, 80], p: [30, 40], k: [60, 80], ph: [5.5, 7.5], rain: [1000, 2000], hum: [50, 70], temp: [25, 35], type: 'Fruit' },
    'banana': { n: [150, 200], p: [50, 60], k: [200, 300], ph: [6.5, 7.5], rain: [1500, 2500], hum: [70, 85], temp: [25, 32], type: 'Fruit' },
    'apple': { n: [60, 80], p: [30, 40], k: [80, 100], ph: [5.5, 6.5], rain: [1000, 1500], hum: [60, 80], temp: [15, 25], type: 'Fruit' },
    'guava': { n: [50, 70], p: [50, 70], k: [50, 70], ph: [4.5, 8.2], rain: [1000, 2000], hum: [60, 80], temp: [20, 30], type: 'Fruit' },
    'orange': { n: [100, 120], p: [50, 70], k: [50, 70], ph: [5.5, 6.5], rain: [600, 1200], hum: [60, 80], temp: [20, 30], type: 'Fruit' },
    'papaya': { n: [200, 250], p: [200, 250], k: [250, 300], ph: [6.0, 7.0], rain: [1500, 2000], hum: [60, 80], temp: [25, 35], type: 'Fruit' },
    'pomegranate': { n: [60, 80], p: [30, 40], k: [30, 40], ph: [6.5, 7.5], rain: [500, 800], hum: [40, 60], temp: [25, 35], type: 'Fruit' },
    'grapes': { n: [60, 80], p: [40, 50], k: [100, 120], ph: [6.5, 7.5], rain: [500, 800], hum: [60, 70], temp: [15, 30], type: 'Fruit' },
    'pineapple': { n: [100, 120], p: [40, 50], k: [100, 120], ph: [4.5, 5.5], rain: [1500, 2500], hum: [70, 90], temp: [22, 32], type: 'Fruit' },
    'watermelon': { n: [80, 100], p: [40, 60], k: [40, 60], ph: [6.0, 7.0], rain: [400, 600], hum: [60, 75], temp: [25, 35], type: 'Fruit' },
    'muskmelon': { n: [80, 100], p: [40, 60], k: [40, 60], ph: [6.0, 7.0], rain: [400, 600], hum: [60, 75], temp: [25, 35], type: 'Fruit' },
    'litchi': { n: [60, 80], p: [40, 50], k: [40, 50], ph: [5.5, 6.5], rain: [1200, 1600], hum: [70, 80], temp: [25, 35], type: 'Fruit' },
    'coconut': { n: [500, 600], p: [300, 400], k: [800, 1000], ph: [5.5, 8.0], rain: [1500, 2500], hum: [70, 90], temp: [25, 30], type: 'Fruit' },
    'rose': { n: [60, 80], p: [40, 50], k: [40, 50], ph: [6.0, 6.5], rain: [700, 1000], hum: [50, 70], temp: [15, 28], type: 'Flower' },
    'marigold': { n: [50, 60], p: [30, 40], k: [30, 40], ph: [6.5, 7.5], rain: [500, 800], hum: [40, 60], temp: [18, 30], type: 'Flower' },
    'jasmine': { n: [60, 80], p: [60, 80], k: [60, 80], ph: [6.0, 7.5], rain: [800, 1000], hum: [60, 80], temp: [25, 35], type: 'Flower' },
    'lotus': { n: [40, 50], p: [40, 50], k: [40, 50], ph: [6.0, 8.0], rain: [1000, 2000], hum: [80, 95], temp: [20, 35], type: 'Flower' },
    'hibiscus': { n: [40, 60], p: [40, 60], k: [40, 60], ph: [6.0, 7.0], rain: [1000, 1500], hum: [60, 80], temp: [20, 35], type: 'Flower' },
    'chrysanthemum': { n: [100, 120], p: [60, 80], k: [60, 80], ph: [6.5, 7.0], rain: [500, 700], hum: [60, 70], temp: [15, 25], type: 'Flower' },
    'tuberose (rajnigandha)': { n: [100, 120], p: [80, 100], k: [60, 80], ph: [6.5, 7.5], rain: [800, 1200], hum: [70, 80], temp: [20, 30], type: 'Flower' },
    'lily': { n: [50, 70], p: [50, 70], k: [100, 120], ph: [6.0, 7.0], rain: [800, 1200], hum: [60, 80], temp: [15, 25], type: 'Flower' },
    'orchid': { n: [20, 30], p: [20, 30], k: [20, 30], ph: [5.5, 6.5], rain: [1500, 2500], hum: [70, 90], temp: [18, 28], type: 'Flower' },
    'paddy seeds': { n: [100, 120], p: [50, 60], k: [50, 60], ph: [6.0, 6.5], rain: [1500, 2500], hum: [85, 95], temp: [25, 32], type: 'Seed' },
    'wheat seeds': { n: [120, 140], p: [60, 80], k: [60, 80], ph: [6.5, 7.5], rain: [600, 800], hum: [60, 70], temp: [15, 25], type: 'Seed' },
    'tomato seeds': { n: [120, 140], p: [80, 100], k: [100, 120], ph: [6.5, 7.0], rain: [600, 800], hum: [70, 85], temp: [22, 28], type: 'Seed' },
    'chili seeds': { n: [120, 140], p: [80, 100], k: [80, 100], ph: [6.5, 7.0], rain: [800, 1200], hum: [70, 80], temp: [25, 30], type: 'Seed' },
    'brinjal seeds': { n: [120, 140], p: [80, 100], k: [60, 80], ph: [6.0, 7.0], rain: [600, 1000], hum: [70, 80], temp: [25, 30], type: 'Seed' },
    'mustard seeds': { n: [100, 120], p: [60, 80], k: [60, 80], ph: [6.5, 7.5], rain: [400, 600], hum: [50, 60], temp: [18, 25], type: 'Seed' },
    'sesame seeds': { n: [40, 60], p: [40, 60], k: [20, 40], ph: [6.0, 7.0], rain: [400, 600], hum: [50, 60], temp: [25, 35], type: 'Seed' },
    'coriander seeds': { n: [60, 80], p: [40, 60], k: [20, 40], ph: [6.0, 7.5], rain: [300, 500], hum: [50, 60], temp: [15, 25], type: 'Seed' },
    'fenugreek seeds': { n: [30, 50], p: [40, 60], k: [20, 40], ph: [6.0, 7.0], rain: [400, 600], hum: [50, 60], temp: [15, 25], type: 'Seed' },
    'fennel seeds': { n: [60, 90], p: [40, 60], k: [30, 50], ph: [6.5, 8.0], rain: [400, 600], hum: [50, 60], temp: [15, 25], type: 'Seed' },
    'garlic': { n: [100, 120], p: [60, 80], k: [60, 80], ph: [6.0, 7.0], rain: [600, 800], hum: [60, 70], temp: [12, 24], type: 'Vegetable' },
    'ginger': { n: [60, 80], p: [40, 60], k: [100, 120], ph: [5.5, 6.5], rain: [1500, 2500], hum: [70, 90], temp: [20, 30], type: 'Cash Crop' },
    'turmeric': { n: [60, 80], p: [40, 60], k: [100, 120], ph: [5.0, 6.5], rain: [1500, 2500], hum: [70, 90], temp: [20, 30], type: 'Cash Crop' },
    'tea': { n: [120, 150], p: [40, 60], k: [40, 60], ph: [4.5, 5.5], rain: [2000, 3000], hum: [80, 95], temp: [15, 25], type: 'Cash Crop' },
    'rubber': { n: [40, 60], p: [40, 60], k: [80, 100], ph: [4.5, 6.0], rain: [2000, 4000], hum: [80, 90], temp: [25, 35], type: 'Cash Crop' },
    'cashew': { n: [40, 60], p: [20, 30], k: [20, 30], ph: [5.0, 6.5], rain: [1000, 2000], hum: [60, 80], temp: [20, 30], type: 'Fruit' },
    'almond': { n: [120, 150], p: [60, 80], k: [100, 120], ph: [6.0, 7.5], rain: [600, 800], hum: [40, 60], temp: [15, 30], type: 'Fruit' },
    'walnut': { n: [100, 120], p: [50, 70], k: [80, 100], ph: [6.0, 7.0], rain: [800, 1200], hum: [50, 70], temp: [10, 25], type: 'Fruit' },
    'cumin': { n: [30, 40], p: [20, 30], k: [20, 30], ph: [6.5, 7.5], rain: [200, 400], hum: [40, 50], temp: [20, 30], type: 'Cash Crop' },
    'black pepper': { n: [40, 60], p: [40, 60], k: [80, 100], ph: [5.0, 6.5], rain: [2000, 3000], hum: [70, 90], temp: [20, 35], type: 'Cash Crop' },
    'cardamom': { n: [40, 60], p: [40, 60], k: [60, 80], ph: [5.0, 6.0], rain: [1500, 2500], hum: [80, 95], temp: [15, 25], type: 'Cash Crop' },
    'fenugreek': { n: [20, 30], p: [40, 50], k: [20, 30], ph: [6.0, 7.0], rain: [400, 600], hum: [50, 60], temp: [15, 25], type: 'Vegetable' },
    'coriander': { n: [40, 60], p: [40, 60], k: [20, 40], ph: [6.0, 7.5], rain: [400, 600], hum: [50, 70], temp: [15, 25], type: 'Vegetable' },
    'mint': { n: [60, 80], p: [40, 60], k: [80, 100], ph: [6.0, 7.5], rain: [1000, 1500], hum: [70, 80], temp: [15, 25], type: 'Vegetable' }
};

export const METADATA = {
    'rice': { 
        season: 'Kharif/Rabi', soil: 'Clayey/Alluvial', loc: 'Tropical/Wetlands', sow: 'Jun-Jul', demand: 'High',
        pest: { all: "Stem Borer, Brown Planthopper, Leaf Folder, Gall Midge, Hispa", most: "Brown Planthopper !!, Stem Borer", water: "High water -> Planthopper", weather: "Warm humid -> outbreak", trigger: "Tillering, flowering", others: "Dense planting !! risk" },
        fert: { common: "Urea, DAP, MOP", compost: "FYM, Green manure, Vermicompost", soil: "Clay soil -> split nitrogen doses; Sandy soil -> more organic matter", weather: "Heavy rain -> avoid single heavy dose; Humid -> reduce nitrogen excess", stage: "Tillering -> Nitrogen high; Panicle formation -> Potassium", others: "Standing water needs controlled application" }
    },
    'wheat': { 
        season: 'Rabi', soil: 'Loamy', loc: 'North Plains', sow: 'Oct-Nov', demand: 'High',
        pest: { all: "Aphids, Termites, Armyworm", most: "Aphids !!", water: "Dry -> Termites", weather: "Cool -> Aphids", trigger: "Grain filling", others: "Late sowing !! risk" },
        fert: { common: "Urea, DAP, MOP", compost: "FYM, Vermicompost", soil: "Sandy -> more compost; Loamy -> balanced NPK", weather: "Cool season -> nitrogen effective; Rain -> split doses", stage: "Crown root stage -> nitrogen; Grain filling -> potassium", others: "Late sowing needs higher nitrogen" }
    },
    'maize (corn)': { 
        season: 'Kharif/Rabi/Summer', soil: 'Loamy', loc: 'Plains', sow: 'May-Jun', demand: 'Medium',
        pest: { all: "Fall Armyworm, Stem Borer, Earworm", most: "Armyworm !!", water: "Humid -> Armyworm", weather: "Monsoon !!", trigger: "Early stage", others: "Night pest" },
        fert: { common: "Urea, DAP, NPK (20:20:20)", compost: "FYM, Vermicompost", soil: "Sandy -> frequent nitrogen; Poor soil -> add compost", weather: "Rain -> nitrogen loss high; Dry -> better uptake", stage: "Early growth -> nitrogen; Cob formation -> potassium", others: "Heavy feeder crop" }
    },
    'barley': { 
        season: 'Rabi', soil: 'Sandy Loam', loc: 'North India', sow: 'Oct-Nov', demand: 'Medium',
        pest: { all: "Aphids, Armyworm", most: "Aphids", water: "Moderate humidity", weather: "Cool", trigger: "Grain stage", others: "Similar to wheat" },
        fert: { common: "Urea, DAP", compost: "FYM", soil: "Light soil -> compost", weather: "Cool -> good uptake", stage: "Tillering -> nitrogen", others: "Low fertilizer requirement" }
    },
    'bajra': { 
        season: 'Kharif/Summer', soil: 'Sandy', loc: 'Arid Zones', sow: 'Jul-Aug', demand: 'Medium',
        pest: { all: "Shoot Fly, Stem Borer", most: "Shoot Fly", water: "Dry !!", weather: "Hot dry", trigger: "Seedling", others: "Early attack" },
        fert: { common: "Low NPK", compost: "FYM", soil: "Dry soil -> organic matter", weather: "Hot -> low fertilizer efficiency", stage: "Early growth -> nitrogen", others: "Drought tolerant" }
    },
    'jowar': { 
        season: 'Kharif/Rabi/Summer', soil: 'Black Soil', loc: 'Semi-arid', sow: 'Jun-Jul', demand: 'Medium',
        pest: { all: "Shoot Fly, Midge", most: "Shoot Fly", water: "Moderate moisture", weather: "Warm", trigger: "Early stage", others: "Similar to Bajra" },
        fert: { common: "Urea, DAP", compost: "FYM", soil: "Medium fertility enough", weather: "Warm", stage: "Vegetative -> nitrogen", others: "Moderate feeder" }
    },
    'ragi': { 
        season: 'Kharif', soil: 'Red/Loamy', loc: 'Hilly Regions', sow: 'Jun-Jul', demand: 'Medium',
        pest: { all: "Stem Borer, Aphids", most: "Aphids", water: "Humid !!", weather: "Warm", trigger: "Vegetative", others: "Minor pest pressure" },
        fert: { common: "NPK", compost: "FYM", soil: "Poor soil -> compost needed", weather: "Humid", stage: "Early growth", others: "Low input crop" }
    },
    'arhar/tur': { 
        season: 'Kharif', soil: 'Well-drained Loam', loc: 'Semi-arid', sow: 'Jun-Jul', demand: 'High',
        pest: { all: "Pod Borer, Aphids, Spodoptera", most: "Pod Borer !!", water: "Dry !!", weather: "Warm", trigger: "Flowering", others: "Severe yield loss" },
        fert: { common: "DAP, SSP", compost: "FYM, Rhizobium inoculation !!", soil: "Low nitrogen soil -> Rhizobium", weather: "Dry -> good nodulation", stage: "Early -> phosphorus", others: "Fixes own nitrogen" }
    },
    'gram/chana': { 
        season: 'Rabi', soil: 'Loamy/Clayey', loc: 'North/Central India', sow: 'Oct-Nov', demand: 'High',
        pest: { all: "Pod Borer, Cutworm", most: "Pod Borer !!", water: "Dry", weather: "Cool", trigger: "Flowering", others: "Night pest" },
        fert: { common: "DAP, SSP", compost: "FYM, Rhizobium", soil: "Low N needed", weather: "Cool", stage: "Root growth", others: "Avoid excess nitrogen" }
    },
    'moong': { 
        season: 'Summer/Kharif/Rabi', soil: 'Loamy', loc: 'Plains', sow: 'Mar-Apr', demand: 'Medium',
        pest: { all: "Whiteflies, Thrips", most: "Whiteflies !!", water: "Humid", weather: "Warm", trigger: "Vegetative", others: "Virus spread" },
        fert: { common: "SSP", compost: "FYM", soil: "Light soil -> compost", weather: "Warm", stage: "Early", others: "Short duration" }
    },
    'urad': { 
        season: 'Summer/Kharif/Rabi', soil: 'Heavy Loam', loc: 'Central India', sow: 'Jun-Jul', demand: 'Medium',
        pest: { all: "Aphids, Leafhopper", most: "Leafhopper", water: "Humid", weather: "Warm", trigger: "Early stage", others: "Sap sucking" },
        fert: { common: "SSP", compost: "FYM", soil: "Medium fertility", weather: "Warm humid", stage: "Early", others: "Nitrogen fixing" }
    },
    'masoor': { 
        season: 'Rabi', soil: 'Alluvial', loc: 'Cool Plains', sow: 'Oct-Nov', demand: 'Medium',
        pest: { all: "Aphids", most: "Aphids", water: "Moderate", weather: "Cool", trigger: "Vegetative", others: "Low diversity" },
        fert: { common: "SSP", compost: "FYM", soil: "Light soil", weather: "Cool", stage: "Early", others: "Low requirement" }
    },
    'kidneybeans': { 
        season: 'Rabi/Summer', soil: 'Loamy', loc: 'Cool Regions', sow: 'Oct-Nov', demand: 'Medium',
        pest: { all: "Bean Fly, Aphids", most: "Bean Fly", water: "Moist", weather: "Cool", trigger: "Seedling", others: "Root damage" },
        fert: { common: "NPK low dose", compost: "FYM", soil: "Rich soil needed", weather: "Cool", stage: "Early", others: "Sensitive crop" }
    },
    'mothbeans': { 
        season: 'Kharif', soil: 'Sandy', loc: 'Arid Zones', sow: 'Jul-Aug', demand: 'Medium',
        pest: { all: "Thrips, Caterpillars", most: "Thrips", water: "Dry", weather: "Hot", trigger: "Vegetative", others: "Low moisture pest" },
        fert: { common: "Minimal", compost: "FYM", soil: "Dry soil", weather: "Hot", stage: "Early", others: "Very low input" }
    },
    'sugarcane': { 
        season: 'Annual', soil: 'Deep Loam', loc: 'Tropical Plains', sow: 'Feb-Mar', demand: 'High',
        pest: { all: "Stem Borer !!", most: "Same", water: "Humid", weather: "Warm", trigger: "Stem", others: "Internal" },
        fert: { common: "High Urea, NPK", compost: "Press mud", soil: "Rich", weather: "Warm", stage: "Growth", others: "Heavy feeder" }
    },
    'cotton': { 
        season: 'Kharif', soil: 'Black Soil', loc: 'Semi-arid/Sunny', sow: 'May-Jun', demand: 'High',
        pest: { all: "Bollworm !!, Whiteflies", most: "Bollworm", water: "Dry", weather: "Hot", trigger: "Boll", others: "Resistance" },
        fert: { common: "NPK", compost: "FYM", soil: "Black soil", weather: "Warm", stage: "Boll", others: "Heavy feeder" }
    },
    'jute': { 
        season: 'Kharif', soil: 'Alluvial', loc: 'Wetlands', sow: 'Mar-May', demand: 'High',
        pest: { all: "Caterpillar", most: "Same", water: "Humid", weather: "Rainy", trigger: "Leaf", others: "Regional" },
        fert: { common: "Nitrogen high", compost: "FYM", soil: "Alluvial", weather: "Humid", stage: "Vegetative", others: "Fast growth" }
    },
    'coffee': { 
        season: 'Perennial', soil: 'Rich Organic', loc: 'Hilly Regions', sow: 'Jun-Jul', demand: 'High',
        pest: { all: "Berry Borer, Mosquito Bug", most: "Same", water: "Humid", weather: "Rainy", trigger: "Leaf/fruit", others: "Plantation issue" },
        fert: { common: "NPK", compost: "Organic mulch", soil: "Acidic", weather: "Humid", stage: "Leaf", others: "Plantation crop" }
    },
    'potato': { 
        season: 'Rabi', soil: 'Loose Loam', loc: 'Plains/Hilly', sow: 'Oct-Nov', demand: 'High',
        pest: { all: "Fruit Borer, Aphids, Thrips, Whiteflies", most: "Fruit Borer !!", water: "Humid -> Whiteflies", weather: "Warm", trigger: "Fruiting", others: "Virus risk" },
        fert: { common: "NPK high, Potash", compost: "FYM, Vermicompost", soil: "Loose soil", weather: "Cool", stage: "Tuber -> potassium", others: "Heavy feeder" }
    },
    'tomato': { 
        season: 'Year-round', soil: 'Loamy', loc: 'Garden/Plains', sow: 'Jan-Feb', demand: 'High',
        pest: { all: "Fruit Borer, Aphids, Thrips, Whiteflies", most: "Fruit Borer !!", water: "Humid -> Whiteflies", weather: "Warm", trigger: "Fruiting", others: "Virus risk" },
        fert: { common: "NPK, Calcium nitrate", compost: "Vermicompost !!", soil: "Well-drained", weather: "Warm", stage: "Fruiting -> potassium", others: "Needs balanced nutrients" }
    },
    'onion': { 
        season: 'Rabi/Kharif', soil: 'Sandy Loam', loc: 'Plains', sow: 'Oct-Nov', demand: 'High',
        pest: { all: "Fruit Borer, Aphids, Thrips, Whiteflies", most: "Fruit Borer !!", water: "Humid -> Whiteflies", weather: "Warm", trigger: "Fruiting", others: "Virus risk" },
        fert: { common: "NPK, Sulfur", compost: "FYM", soil: "Light soil", weather: "Dry", stage: "Bulb -> potassium", others: "Sulfur important" }
    },
    'brinjal (eggplant)': { 
        season: 'Year-round', soil: 'Rich Loam', loc: 'Tropical Plains', sow: 'Jun-Jul', demand: 'Medium',
        pest: { all: "Shoot & Fruit Borer, Aphids", most: "Borer !!", water: "Humid", weather: "Warm", trigger: "Fruiting", others: "Internal damage" },
        fert: { common: "NPK", compost: "Vermicompost", soil: "Rich soil", weather: "Warm", stage: "Fruiting", others: "Continuous feeding" }
    },
    'okra (ladyfinger)': { 
        season: 'Summer/Kharif', soil: 'Sandy Loam', loc: 'Warm Regions', sow: 'Feb-Mar', demand: 'Medium',
        pest: { all: "Aphids, Whiteflies", most: "Whiteflies !!", water: "Humid", weather: "Warm", trigger: "Vegetative", others: "Virus" },
        fert: { common: "NPK", compost: "FYM", soil: "Medium", weather: "Warm", stage: "Vegetative", others: "Balanced feeding" }
    },
    'chili': { 
        season: 'Kharif/Rabi', soil: 'Well-drained Loam', loc: 'Plains/Tropical', sow: 'Jun-Jul', demand: 'High',
        pest: { all: "Thrips, Mites", most: "Thrips !!", water: "Dry", weather: "Hot", trigger: "Flowering", others: "Leaf curl" },
        fert: { common: "NPK, Potash", compost: "Vermicompost", soil: "Well-drained", weather: "Warm", stage: "Fruiting", others: "Sensitive crop" }
    },
    'mango': { 
        season: 'Perennial', soil: 'Alluvial/Red', loc: 'Tropical', sow: 'Jun-Jul', demand: 'High',
        pest: { all: "Fruit Fly, Hopper, Mealybug", most: "Fruit Fly !!", water: "Humid", weather: "Rainy", trigger: "Fruiting", others: "Post harvest" },
        fert: { common: "NPK + Urea", compost: "FYM !!", soil: "Deep soil", weather: "Seasonal", stage: "Fruiting -> potassium", others: "Annual feeding" }
    },
    'banana': { 
        season: 'Perennial', soil: 'Rich Loam', loc: 'Tropical', sow: 'Jun-Jul', demand: 'High',
        pest: { all: "Weevil, Aphids", most: "Weevil !!", water: "Wet", weather: "Humid", trigger: "Root/stem", others: "Hidden pest" },
        fert: { common: "High NPK", compost: "FYM", soil: "Moist", weather: "Humid", stage: "Growth", others: "Heavy feeder" }
    },
    'apple': { 
        season: 'Perennial', soil: 'Hilly Loam', loc: 'Cool Hills', sow: 'Dec-Jan', demand: 'High',
        pest: { all: "Codling Moth", most: "Same", water: "Moderate", weather: "Cool", trigger: "Fruit", others: "Region-specific" },
        fert: { common: "NPK", compost: "FYM", soil: "Well-drained", weather: "Cool", stage: "Fruiting", others: "Region-specific" }
    },
    'coconut': { 
        season: 'Perennial', soil: 'Coastal/Sandy', loc: 'Coastal Regions', sow: 'Jun-Jul', demand: 'High',
        pest: { all: "Rhinoceros Beetle", most: "Same", water: "Coastal humidity", weather: "Warm", trigger: "Crown", others: "Tree damage" },
        fert: { common: "Balanced NPK", compost: "FYM", soil: "Coastal/Sandy", weather: "Warm", stage: "Growth", others: "Regular feeding" }
    },
    'cabbage': {
        season: 'Winter', soil: 'Rich Loam', loc: 'WB', sow: 'Sep-Oct', demand: 'Medium',
        pest: { all: "Diamondback Moth, Aphids", most: "DBM !!", water: "Humid", weather: "Cool", trigger: "Leaf stage", others: "Fast spread" },
        fert: { common: "Nitrogen high", compost: "Vermicompost", soil: "Rich soil", weather: "Cool", stage: "Leaf growth", others: "Fast growth" }
    },
    'cauliflower': {
        season: 'Winter', soil: 'Rich Loam', loc: 'WB', sow: 'Sep-Oct', demand: 'Medium',
        pest: { all: "Diamondback Moth, Aphids", most: "DBM !!", water: "Humid", weather: "Cool", trigger: "Leaf stage", others: "Fast spread" },
        fert: { common: "Nitrogen high", compost: "Vermicompost", soil: "Rich soil", weather: "Cool", stage: "Leaf growth", others: "Fast growth" }
    },
    'spinach': {
        season: 'Winter', soil: 'Rich Loam', loc: 'WB', sow: 'Sep-Oct', demand: 'Medium',
        pest: { all: "Diamondback Moth, Aphids", most: "DBM !!", water: "Humid", weather: "Cool", trigger: "Leaf stage", others: "Fast spread" },
        fert: { common: "Nitrogen high", compost: "Vermicompost", soil: "Rich soil", weather: "Cool", stage: "Leaf growth", others: "Fast growth" }
    },
    'carrot': {
        season: 'Winter', soil: 'Sandy Loam', loc: 'North/East', sow: 'Oct-Nov', demand: 'Medium',
        pest: { all: "Root Maggot, Aphids", most: "Root Maggot", water: "Wet soil", weather: "Cool", trigger: "Root stage", others: "Soil pest" },
        fert: { common: "NPK", compost: "FYM", soil: "Sandy loam", weather: "Cool", stage: "Vegetative", others: "Balanced feeding" }
    },
    'radish': {
        season: 'Winter', soil: 'Sandy Loam', loc: 'North/East', sow: 'Oct-Nov', demand: 'Medium',
        pest: { all: "Root Maggot, Aphids", most: "Root Maggot", water: "Wet soil", weather: "Cool", trigger: "Root stage", others: "Soil pest" },
        fert: { common: "NPK", compost: "FYM", soil: "Sandy loam", weather: "Cool", stage: "Vegetative", others: "Balanced feeding" }
    },
    'peas': {
        season: 'Winter', soil: 'Sandy Loam', loc: 'North/East', sow: 'Oct-Nov', demand: 'Medium',
        pest: { all: "Root Maggot, Aphids", most: "Root Maggot", water: "Wet soil", weather: "Cool", trigger: "Root stage", others: "Soil pest" },
        fert: { common: "NPK", compost: "FYM", soil: "Sandy loam", weather: "Cool", stage: "Vegetative", others: "Balanced feeding" }
    },
    'pumpkin': {
        season: 'Summer/Kharif', soil: 'Sandy Loam', loc: 'WB', sow: 'Feb-Mar', demand: 'Low',
        pest: { all: "Fruit Fly !!", most: "Fruit Fly", water: "Humid", weather: "Rainy", trigger: "Fruiting", others: "Major loss" },
        fert: { common: "NPK", compost: "FYM", soil: "Sandy loam", weather: "Warm humid", stage: "Fruiting", others: "Fast growth" }
    },
    'bottle gourd (lauki)': {
        season: 'Summer/Kharif', soil: 'Sandy Loam', loc: 'WB', sow: 'Feb-Mar', demand: 'Low',
        pest: { all: "Fruit Fly !!", most: "Fruit Fly", water: "Humid", weather: "Rainy", trigger: "Fruiting", others: "Major loss" },
        fert: { common: "NPK", compost: "FYM", soil: "Sandy loam", weather: "Warm humid", stage: "Fruiting", others: "Fast growth" }
    },
    'bitter gourd (karela)': {
        season: 'Summer/Kharif', soil: 'Sandy Loam', loc: 'WB', sow: 'Feb-Mar', demand: 'Low',
        pest: { all: "Fruit Fly !!", most: "Fruit Fly", water: "Humid", weather: "Rainy", trigger: "Fruiting", others: "Major loss" },
        fert: { common: "NPK", compost: "FYM", soil: "Sandy loam", weather: "Warm humid", stage: "Fruiting", others: "Fast growth" }
    },
    'cucumber': {
        season: 'Summer/Rabi', soil: 'Well-drained', loc: 'Common', sow: 'Feb-Mar', demand: 'Medium',
        pest: { all: "Aphids, Beetles", most: "Aphids", water: "Humid", weather: "Warm", trigger: "Vegetative", others: "Sap sucking" },
        fert: { common: "NPK", compost: "FYM", soil: "Well-drained", weather: "Warm", stage: "Vegetative", others: "Moderate feeder" }
    },
    'beans': {
        season: 'Summer/Rabi', soil: 'Well-drained', loc: 'Common', sow: 'Feb-Mar', demand: 'Medium',
        pest: { all: "Aphids, Beetles", most: "Aphids", water: "Humid", weather: "Warm", trigger: "Vegetative", others: "Sap sucking" },
        fert: { common: "NPK", compost: "FYM", soil: "Well-drained", weather: "Warm", stage: "Vegetative", others: "Moderate feeder" }
    },
    'garlic': {
        season: 'Summer/Rabi', soil: 'Well-drained', loc: 'Common', sow: 'Feb-Mar', demand: 'Medium',
        pest: { all: "Aphids, Beetles", most: "Aphids", water: "Humid", weather: "Warm", trigger: "Vegetative", others: "Sap sucking" },
        fert: { common: "NPK", compost: "FYM", soil: "Well-drained", weather: "Warm", stage: "Vegetative", others: "Moderate feeder" }
    },
    'fenugreek': {
        season: 'Winter', soil: 'Rich Loam', loc: 'WB', sow: 'Sep-Oct', demand: 'Medium',
        pest: { all: "Aphids", most: "Aphids", water: "Cool moist", weather: "Winter", trigger: "Leaf stage", others: "Fast spread" },
        fert: { common: "Nitrogen high", compost: "Vermicompost !!", soil: "Rich soil", weather: "Cool", stage: "Leaf", others: "Quick harvest" }
    },
    'coriander': {
        season: 'Winter', soil: 'Rich Loam', loc: 'WB', sow: 'Sep-Oct', demand: 'Medium',
        pest: { all: "Aphids", most: "Aphids", water: "Cool moist", weather: "Winter", trigger: "Leaf stage", others: "Fast spread" },
        fert: { common: "Nitrogen high", compost: "Vermicompost !!", soil: "Rich soil", weather: "Cool", stage: "Leaf", others: "Quick harvest" }
    },
    'mint': {
        season: 'Winter', soil: 'Rich Loam', loc: 'WB', sow: 'Sep-Oct', demand: 'Medium',
        pest: { all: "Aphids", most: "Aphids", water: "Cool moist", weather: "Winter", trigger: "Leaf stage", others: "Fast spread" },
        fert: { common: "Nitrogen high", compost: "Vermicompost !!", soil: "Rich soil", weather: "Cool", stage: "Leaf", others: "Quick harvest" }
    },
    'rose': {
        season: 'Year-round', soil: 'Rich', loc: 'WB', sow: 'Feb-Mar', demand: 'Medium',
        pest: { all: "Thrips !!, Aphids, Mites", most: "Thrips", water: "Humid", weather: "Warm", trigger: "Flowering", others: "Quality loss" },
        fert: { common: "NPK + Potash", compost: "Vermicompost !!", soil: "Rich", weather: "Moderate", stage: "Flowering", others: "Quality dependent" }
    },
    'marigold': {
        season: 'Year-round', soil: 'Rich', loc: 'WB', sow: 'Feb-Mar', demand: 'Medium',
        pest: { all: "Thrips !!, Aphids, Mites", most: "Thrips", water: "Humid", weather: "Warm", trigger: "Flowering", others: "Quality loss" },
        fert: { common: "NPK + Potash", compost: "Vermicompost !!", soil: "Rich", weather: "Moderate", stage: "Flowering", others: "Quality dependent" }
    },
    'jasmine': {
        season: 'Year-round', soil: 'Rich', loc: 'WB', sow: 'Feb-Mar', demand: 'Medium',
        pest: { all: "Thrips !!, Aphids, Mites", most: "Thrips", water: "Humid", weather: "Warm", trigger: "Flowering", others: "Quality loss" },
        fert: { common: "NPK + Potash", compost: "Vermicompost !!", soil: "Rich", weather: "Moderate", stage: "Flowering", others: "Quality dependent" }
    },
    'lotus': {
        season: 'Year-round', soil: 'Rich', loc: 'WB', sow: 'Feb-Mar', demand: 'Medium',
        pest: { all: "Thrips !!, Aphids, Mites", most: "Thrips", water: "Humid", weather: "Warm", trigger: "Flowering", others: "Quality loss" },
        fert: { common: "NPK + Potash", compost: "Vermicompost !!", soil: "Rich", weather: "Moderate", stage: "Flowering", others: "Quality dependent" }
    },
    'hibiscus': {
        season: 'Year-round', soil: 'Rich', loc: 'WB', sow: 'Feb-Mar', demand: 'Medium',
        pest: { all: "Thrips !!, Aphids, Mites", most: "Thrips", water: "Humid", weather: "Warm", trigger: "Flowering", others: "Quality loss" },
        fert: { common: "NPK + Potash", compost: "Vermicompost !!", soil: "Rich", weather: "Moderate", stage: "Flowering", others: "Quality dependent" }
    },
    'chrysanthemum': {
        season: 'Year-round', soil: 'Rich', loc: 'WB', sow: 'Feb-Mar', demand: 'Medium',
        pest: { all: "Thrips !!, Aphids, Mites", most: "Thrips", water: "Humid", weather: "Warm", trigger: "Flowering", others: "Quality loss" },
        fert: { common: "NPK + Potash", compost: "Vermicompost !!", soil: "Rich", weather: "Moderate", stage: "Flowering", others: "Quality dependent" }
    },
    'tuberose (rajnigandha)': {
        season: 'Year-round', soil: 'Rich', loc: 'WB', sow: 'Feb-Mar', demand: 'Medium',
        pest: { all: "Thrips !!, Aphids, Mites", most: "Thrips", water: "Humid", weather: "Warm", trigger: "Flowering", others: "Quality loss" },
        fert: { common: "NPK + Potash", compost: "Vermicompost !!", soil: "Rich", weather: "Moderate", stage: "Flowering", others: "Quality dependent" }
    },
    'lily': {
        season: 'Year-round', soil: 'Rich', loc: 'WB', sow: 'Feb-Mar', demand: 'Medium',
        pest: { all: "Thrips !!, Aphids, Mites", most: "Thrips", water: "Humid", weather: "Warm", trigger: "Flowering", others: "Quality loss" },
        fert: { common: "NPK + Potash", compost: "Vermicompost !!", soil: "Rich", weather: "Moderate", stage: "Flowering", others: "Quality dependent" }
    },
    'orchid': {
        season: 'Year-round', soil: 'Rich', loc: 'WB', sow: 'Feb-Mar', demand: 'Medium',
        pest: { all: "Thrips !!, Aphids, Mites", most: "Thrips", water: "Humid", weather: "Warm", trigger: "Flowering", others: "Quality loss" },
        fert: { common: "NPK + Potash", compost: "Vermicompost !!", soil: "Rich", weather: "Moderate", stage: "Flowering", others: "Quality dependent" }
    },
    'paddy seeds': {
        season: 'Controlled', soil: 'Fine, loose', loc: 'Nurseries', sow: 'Year-round', demand: 'High',
        pest: { all: "Cutworms, Aphids, Fungus Gnats", most: "Damping-off !!", water: "Overwatering", weather: "Cool + wet", trigger: "Germination", others: "Critical stage" },
        fert: { common: "Very low NPK", compost: "Vermicompost + cocopeat !!", soil: "Fine, loose", weather: "Controlled", stage: "Germination", others: "Overfeeding kills plants" }
    },
    'wheat seeds': {
        season: 'Controlled', soil: 'Fine, loose', loc: 'Nurseries', sow: 'Year-round', demand: 'High',
        pest: { all: "Cutworms, Aphids, Fungus Gnats", most: "Damping-off !!", water: "Overwatering", weather: "Cool + wet", trigger: "Germination", others: "Critical stage" },
        fert: { common: "Very low NPK", compost: "Vermicompost + cocopeat !!", soil: "Fine, loose", weather: "Controlled", stage: "Germination", others: "Overfeeding kills plants" }
    },
    'tomato seeds': {
        season: 'Controlled', soil: 'Fine, loose', loc: 'Nurseries', sow: 'Year-round', demand: 'High',
        pest: { all: "Cutworms, Aphids, Fungus Gnats", most: "Damping-off !!", water: "Overwatering", weather: "Cool + wet", trigger: "Germination", others: "Critical stage" },
        fert: { common: "Very low NPK", compost: "Vermicompost + cocopeat !!", soil: "Fine, loose", weather: "Controlled", stage: "Germination", others: "Overfeeding kills plants" }
    },
    'chili seeds': {
        season: 'Controlled', soil: 'Fine, loose', loc: 'Nurseries', sow: 'Year-round', demand: 'High',
        pest: { all: "Cutworms, Aphids, Fungus Gnats", most: "Damping-off !!", water: "Overwatering", weather: "Cool + wet", trigger: "Germination", others: "Critical stage" },
        fert: { common: "Very low NPK", compost: "Vermicompost + cocopeat !!", soil: "Fine, loose", weather: "Controlled", stage: "Germination", others: "Overfeeding kills plants" }
    },
    'brinjal seeds': {
        season: 'Controlled', soil: 'Fine, loose', loc: 'Nurseries', sow: 'Year-round', demand: 'High',
        pest: { all: "Cutworms, Aphids, Fungus Gnats", most: "Damping-off !!", water: "Overwatering", weather: "Cool + wet", trigger: "Germination", others: "Critical stage" },
        fert: { common: "Very low NPK", compost: "Vermicompost + cocopeat !!", soil: "Fine, loose", weather: "Controlled", stage: "Germination", others: "Overfeeding kills plants" }
    },
    'mustard seeds': {
        season: 'Controlled', soil: 'Fine, loose', loc: 'Nurseries', sow: 'Year-round', demand: 'High',
        pest: { all: "Cutworms, Aphids, Fungus Gnats", most: "Damping-off !!", water: "Overwatering", weather: "Cool + wet", trigger: "Germination", others: "Critical stage" },
        fert: { common: "Very low NPK", compost: "Vermicompost + cocopeat !!", soil: "Fine, loose", weather: "Controlled", stage: "Germination", others: "Overfeeding kills plants" }
    },
    'sesame seeds': {
        season: 'Controlled', soil: 'Fine, loose', loc: 'Nurseries', sow: 'Year-round', demand: 'High',
        pest: { all: "Cutworms, Aphids, Fungus Gnats", most: "Damping-off !!", water: "Overwatering", weather: "Cool + wet", trigger: "Germination", others: "Critical stage" },
        fert: { common: "Very low NPK", compost: "Vermicompost + cocopeat !!", soil: "Fine, loose", weather: "Controlled", stage: "Germination", others: "Overfeeding kills plants" }
    },
    'coriander seeds': {
        season: 'Controlled', soil: 'Fine, loose', loc: 'Nurseries', sow: 'Year-round', demand: 'High',
        pest: { all: "Cutworms, Aphids, Fungus Gnats", most: "Damping-off !!", water: "Overwatering", weather: "Cool + wet", trigger: "Germination", others: "Critical stage" },
        fert: { common: "Very low NPK", compost: "Vermicompost + cocopeat !!", soil: "Fine, loose", weather: "Controlled", stage: "Germination", others: "Overfeeding kills plants" }
    },
    'fenugreek seeds': {
        season: 'Controlled', soil: 'Fine, loose', loc: 'Nurseries', sow: 'Year-round', demand: 'High',
        pest: { all: "Cutworms, Aphids, Fungus Gnats", most: "Damping-off !!", water: "Overwatering", weather: "Cool + wet", trigger: "Germination", others: "Critical stage" },
        fert: { common: "Very low NPK", compost: "Vermicompost + cocopeat !!", soil: "Fine, loose", weather: "Controlled", stage: "Germination", others: "Overfeeding kills plants" }
    },
    'fennel seeds': {
        season: 'Controlled', soil: 'Fine, loose', loc: 'Nurseries', sow: 'Year-round', demand: 'High',
        pest: { all: "Cutworms, Aphids, Fungus Gnats", most: "Damping-off !!", water: "Overwatering", weather: "Cool + wet", trigger: "Germination", others: "Critical stage" },
        fert: { common: "Very low NPK", compost: "Vermicompost + cocopeat !!", soil: "Fine, loose", weather: "Controlled", stage: "Germination", others: "Overfeeding kills plants" }
    },
    'capsicum (bell pepper)': {
        season: 'Summer/Kharif', soil: 'Rich Loam', loc: 'WB', sow: 'Feb-Mar', demand: 'High',
        pest: { all: "Thrips, Mites", most: "Thrips !!", water: "Dry", weather: "Hot", trigger: "Flowering", others: "Leaf curl" },
        fert: { common: "NPK, Potash", compost: "Vermicompost", soil: "Well-drained", weather: "Warm", stage: "Fruiting", others: "Sensitive crop" }
    },
    'guava': {
        season: 'Perennial', soil: 'Alluvial/Red', loc: 'Tropical', sow: 'Jun-Jul', demand: 'High',
        pest: { all: "Fruit Fly, Aphids", most: "Fruit Fly !!", water: "Humid", weather: "Warm", trigger: "Fruiting", others: "Common" },
        fert: { common: "NPK", compost: "FYM", soil: "Slightly acidic", weather: "Warm", stage: "Fruiting", others: "Regular feeding" }
    },
    'orange': {
        season: 'Perennial', soil: 'Deep Loam', loc: 'Sub-tropical', sow: 'Jul-Aug', demand: 'High',
        pest: { all: "Citrus Canker, Fruit Fly", most: "Fruit Fly !!", water: "Humid", weather: "Warm", trigger: "Fruiting", others: "Regular feeding" },
        fert: { common: "NPK", compost: "FYM", soil: "Slightly acidic", weather: "Warm", stage: "Fruiting", others: "Regular feeding" }
    },
    'papaya': {
        season: 'Perennial', soil: 'Sandy Loam', loc: 'Tropical', sow: 'Sep-Oct', demand: 'High',
        pest: { all: "Aphids, Fruit Fly", most: "Fruit Fly !!", water: "Humid", weather: "Warm", trigger: "Fruiting", others: "Regular feeding" },
        fert: { common: "NPK", compost: "FYM", soil: "Slightly acidic", weather: "Warm", stage: "Fruiting", others: "Regular feeding" }
    },
    'pomegranate': {
        season: 'Perennial', soil: 'Arid/Loamy', loc: 'Dry Regions', sow: 'Jul-Aug', demand: 'High',
        pest: { all: "Fruit Borer, Aphids", most: "Fruit Fly !!", water: "Humid", weather: "Warm", trigger: "Fruiting", others: "Regular feeding" },
        fert: { common: "NPK", compost: "FYM", soil: "Slightly acidic", weather: "Warm", stage: "Fruiting", others: "Regular feeding" }
    },
    'grapes': {
        season: 'Perennial', soil: 'Well-drained', loc: 'Temperate', sow: 'Jan-Feb', demand: 'High',
        pest: { all: "Mildew, Fruit Fly", most: "Fruit Fly !!", water: "Humid", weather: "Warm", trigger: "Fruiting", others: "Regular feeding" },
        fert: { common: "NPK", compost: "FYM", soil: "Slightly acidic", weather: "Warm", stage: "Fruiting", others: "Regular feeding" }
    },
    'pineapple': {
        season: 'Perennial', soil: 'Acidic Loam', loc: 'High Rainfall', sow: 'Aug-Sep', demand: 'High',
        pest: { all: "Mealybugs, Fruit Fly", most: "Fruit Fly !!", water: "Humid", weather: "Warm", trigger: "Fruiting", others: "Regular feeding" },
        fert: { common: "NPK", compost: "FYM", soil: "Slightly acidic", weather: "Warm", stage: "Fruiting", others: "Regular feeding" }
    },
    'watermelon': {
        season: 'Summer', soil: 'Sandy', loc: 'Riverbeds', sow: 'Jan-Feb', demand: 'High',
        pest: { all: "Fruit Fly !!", most: "Fruit Fly", water: "Humid", weather: "Rainy", trigger: "Fruit", others: "Severe" },
        fert: { common: "Balanced NPK", compost: "FYM", soil: "Medium", weather: "Warm", stage: "Growth", others: "Moderate" }
    },
    'muskmelon': {
        season: 'Summer', soil: 'Sandy', loc: 'Plains', sow: 'Jan-Feb', demand: 'Medium',
        pest: { all: "Fruit Fly !!", most: "Fruit Fly", water: "Humid", weather: "Rainy", trigger: "Fruit", others: "Severe" },
        fert: { common: "Balanced NPK", compost: "FYM", soil: "Medium", weather: "Warm", stage: "Growth", others: "Moderate" }
    },
    'litchi': {
        season: 'Perennial', soil: 'Deep Alluvial', loc: 'Humid Sub-tropical', sow: 'Jun-Jul', demand: 'High',
        pest: { all: "Mites, Fruit Fly", most: "Fruit Fly !!", water: "Humid", weather: "Warm", trigger: "Fruiting", others: "Regular feeding" },
        fert: { common: "NPK", compost: "FYM", soil: "Slightly acidic", weather: "Warm", stage: "Fruiting", others: "Regular feeding" }
    },
    'cashew': {
        season: 'Perennial', soil: 'Sandy/Laterite', loc: 'Coastal Regions', sow: 'Jun-Jul', demand: 'Medium',
        pest: { all: "Tea Mosquito Bug, Borers", most: "Borers", water: "Moderate", weather: "Warm", trigger: "Tree stage", others: "Slow damage" },
        fert: { common: "Balanced NPK", compost: "FYM", soil: "Medium", weather: "Warm", stage: "Growth", others: "Moderate" }
    },
    'almond': {
        season: 'Perennial', soil: 'Deep Loam', loc: 'Temperate', sow: 'Dec-Jan', demand: 'High',
        pest: { all: "Aphids, Borers", most: "Borers", water: "Moderate", weather: "Warm", trigger: "Tree stage", others: "Slow damage" },
        fert: { common: "Balanced NPK", compost: "FYM", soil: "Medium", weather: "Warm", stage: "Growth", others: "Moderate" }
    },
    'walnut': {
        season: 'Perennial', soil: 'Rich Loam', loc: 'Cool Valleys', sow: 'Dec-Jan', demand: 'High',
        pest: { all: "Codling Moth, Borers", most: "Borers", water: "Moderate", weather: "Warm", trigger: "Tree stage", others: "Slow damage" },
        fert: { common: "Balanced NPK", compost: "FYM", soil: "Medium", weather: "Warm", stage: "Growth", others: "Moderate" }
    },
    'tea': {
        season: 'Perennial', soil: 'Acidic Loam', loc: 'Hilly Regions', sow: 'Jun-Jul', demand: 'High',
        pest: { all: "Tea Mosquito Bug, Berry Borer", most: "Same", water: "Humid", weather: "Rainy", trigger: "Leaf/fruit", others: "Plantation issue" },
        fert: { common: "NPK", compost: "Organic mulch", soil: "Acidic", weather: "Humid", stage: "Leaf", others: "Plantation crop" }
    },
    'rubber': {
        season: 'Perennial', soil: 'Laterite', loc: 'Coastal Hills', sow: 'Jun-Jul', demand: 'High',
        pest: { all: "Leaf Fall, Borers", most: "Borers", water: "Moderate", weather: "Warm", trigger: "Tree stage", others: "Slow damage" },
        fert: { common: "Balanced NPK", compost: "FYM", soil: "Medium", weather: "Warm", stage: "Growth", others: "Moderate" }
    },
    'ginger': {
        season: 'Annual', soil: 'Loose Loam', loc: 'Hilly/Humid', sow: 'Apr-May', demand: 'High',
        pest: { all: "Rhizome Rot, Thrips", most: "Thrips", water: "Wet", weather: "Humid", trigger: "Root", others: "Rot" },
        fert: { common: "NPK", compost: "Organic compost", soil: "Loose", weather: "Humid", stage: "Root", others: "Sensitive" }
    },
    'turmeric': {
        season: 'Annual', soil: 'Sandy Loam', loc: 'Tropical', sow: 'May-Jun', demand: 'High',
        pest: { all: "Leaf Spot, Thrips", most: "Thrips", water: "Wet", weather: "Humid", trigger: "Root", others: "Rot" },
        fert: { common: "NPK", compost: "Organic compost", soil: "Loose", weather: "Humid", stage: "Root", others: "Sensitive" }
    },
    'cumin': {
        season: 'Rabi', soil: 'Well-drained Loam', loc: 'Arid/Semi-arid', sow: 'Oct-Nov', demand: 'High',
        pest: { all: "Wilt, Thrips", most: "Thrips", water: "Wet", weather: "Humid", trigger: "Root", others: "Rot" },
        fert: { common: "NPK", compost: "Organic compost", soil: "Loose", weather: "Humid", stage: "Root", others: "Sensitive" }
    },
    'black pepper': {
        season: 'Perennial', soil: 'Laterite', loc: 'High Rainfall', sow: 'Jun-Jul', demand: 'High',
        pest: { all: "Pollu Beetle, Thrips", most: "Thrips", water: "Wet", weather: "Humid", trigger: "Root", others: "Rot" },
        fert: { common: "NPK", compost: "Organic compost", soil: "Loose", weather: "Humid", stage: "Root", others: "Sensitive" }
    },
    'cardamom': {
        season: 'Perennial', soil: 'Forest Loam', loc: 'Western Ghats', sow: 'Jun-Jul', demand: 'High',
        pest: { all: "Thrips, Rot pests", most: "Thrips", water: "Wet", weather: "Humid", trigger: "Root", others: "Rot" },
        fert: { common: "NPK", compost: "Organic compost", soil: "Loose", weather: "Humid", stage: "Root", others: "Sensitive" }
    },
    'groundnut (peanut)': {
        season: 'Kharif/Rabi/Summer', soil: 'Sandy Loam', loc: 'Arid/Semi-arid', sow: 'Jun-Jul', demand: 'High',
        pest: { all: "White Grub, Aphids, Whiteflies", most: "Aphids", water: "Humid", weather: "Cool", trigger: "Vegetative", others: "Sap sucking" },
        fert: { common: "NPK + Sulfur", compost: "FYM", soil: "Light", weather: "Cool", stage: "Flowering", others: "Oil quality depends" }
    },
    'mustard': {
        season: 'Rabi', soil: 'Sandy Loam', loc: 'North India', sow: 'Oct-Nov', demand: 'High',
        pest: { all: "Aphids, Whiteflies", most: "Aphids", water: "Humid", weather: "Cool", trigger: "Vegetative", others: "Sap sucking" },
        fert: { common: "NPK + Sulfur", compost: "FYM", soil: "Light", weather: "Cool", stage: "Flowering", others: "Oil quality depends" }
    },
    'soybean': {
        season: 'Kharif', soil: 'Black Soil', loc: 'Plains', sow: 'Jun-Jul', demand: 'High',
        pest: { all: "Girdle Beetle, Aphids, Whiteflies", most: "Aphids", water: "Humid", weather: "Cool", trigger: "Vegetative", others: "Sap sucking" },
        fert: { common: "NPK + Sulfur", compost: "FYM", soil: "Light", weather: "Cool", stage: "Flowering", others: "Oil quality depends" }
    },
    'sunflower': {
        season: 'Kharif/Rabi/Summer', soil: 'Deep Loam', loc: 'Open Sunny Fields', sow: 'Mar-Apr', demand: 'Medium',
        pest: { all: "Cutworms, Aphids, Whiteflies", most: "Aphids", water: "Humid", weather: "Cool", trigger: "Vegetative", others: "Sap sucking" },
        fert: { common: "NPK + Sulfur", compost: "FYM", soil: "Light", weather: "Cool", stage: "Flowering", others: "Oil quality depends" }
    }
};

// ALIAS MAPPING
export const ALIASES = {
    'pigeonpeas': 'arhar/tur',
    'chickpea': 'gram/chana',
    'mungbean': 'moong',
    'blackgram': 'urad',
    'lentil': 'masoor',
    'maize': 'maize (corn)',
    'sesame': 'sesame seeds',
    'eggplant': 'brinjal (eggplant)',
    'ladyfinger': 'okra (ladyfinger)',
    'bell pepper': 'capsicum (bell pepper)',
    'lauki': 'bottle gourd (lauki)',
    'karela': 'bitter gourd (karela)',
    'rajnigandha': 'tuberose (rajnigandha)',
    'pigeon pea': 'arhar/tur',
    'mung bean': 'moong',
    'black gram': 'urad',
    'corn': 'maize (corn)'
};
