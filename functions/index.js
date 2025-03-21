const functions = require('firebase-functions');
const cors = require('cors');
const { Groq } = require('groq-sdk');
const admin = require('firebase-admin');
const { encrypt, decrypt } = require('./utils/encryption');

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Groq client with environment variable
const groq = new Groq({
    apiKey: functions.config().groq.api_key
});

// CORS middleware
const corsHandler = cors({
    origin: ['https://taheralsharif.github.io', 'http://localhost:5000', 'http://127.0.0.1:5000'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
});

exports.getAIAnalysis = functions.https.onRequest((request, response) => {
    // Set CORS headers for all responses
    response.set('Access-Control-Allow-Origin', 'https://taheralsharif.github.io');
    response.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.set('Access-Control-Allow-Credentials', 'true');
    response.set('Access-Control-Max-Age', '3600');

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
        response.status(204).send('');
        return;
    }

    return corsHandler(request, response, async () => {
        try {
            if (request.method !== 'POST') {
                response.status(405).send('Method Not Allowed');
                return;
            }

            // Verify Firebase Auth token
            const authHeader = request.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                response.status(401).send('Unauthorized');
                return;
            }

            const idToken = authHeader.split('Bearer ')[1];
            try {
                await admin.auth().verifyIdToken(idToken);
            } catch (error) {
                console.error('Auth error:', error);
                response.status(401).send('Unauthorized');
                return;
            }

            const { propertyData, estimatedRent } = request.body;

            if (!propertyData || !estimatedRent) {
                response.status(400).send('Missing required data');
                return;
            }

            const prompt = `Analyze this real estate investment:

Property Details:
- Price: $${propertyData.price.toLocaleString()}
- Monthly Rent: $${estimatedRent.toLocaleString()}
- Type: ${propertyData.propertyType}
- Size: ${propertyData.beds} beds, ${propertyData.baths} baths, ${propertyData.sqft.toLocaleString()} sqft
- Built: ${propertyData.yearBuilt}
- Location: ${propertyData.address}

Provide a clear, concise analysis with:
1. Investment Verdict: GOOD, MODERATE, or POOR
2. Key Strengths (2-3 points)
3. Main Risks (2-3 points)
4. Market Outlook (1-2 sentences)
5. Recommendations (2-3 actionable points)

Format the response in a clear, easy-to-read structure with bullet points.`;

            const completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are a real estate investment expert providing detailed analysis of investment opportunities."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                model: "mixtral-8x7b-32768",
                temperature: 0.7,
                max_tokens: 1000
            });

            const analysis = completion.choices[0]?.message?.content || 'No analysis available';

            response.status(200).json({ analysis });
        } catch (error) {
            console.error('Error in getAIAnalysis:', error);
            response.status(500).send('Internal Server Error');
        }
    });
});

// Function to get Google Maps API key
exports.getGoogleMapsKey = functions.https.onCall(async (data, context) => {
    // Check if user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
        const key = await getEncryptedKey('googleMapsKey');
        return { apiKey: key };
    } catch (error) {
        console.error('Error getting Google Maps key:', error);
        throw new functions.https.HttpsError('internal', 'Failed to get API key');
    }
});

// Function to get Zillow API key
exports.getZillowKey = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        try {
            const key = await getEncryptedKey('zillowKey');
            res.json({ apiKey: key });
        } catch (error) {
            console.error('Error getting Zillow key:', error);
            res.status(500).json({ error: 'Failed to get API key' });
        }
    });
});

// Function to analyze investment
exports.analyzeInvestment = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        try {
            const { propertyData, estimatedRent } = req.body;
            const analysis = await analyzeInvestmentWithAI(propertyData, estimatedRent);
            res.json({ analysis });
        } catch (error) {
            console.error('Error analyzing investment:', error);
            res.status(500).json({ error: 'Failed to analyze investment' });
        }
    });
}); 