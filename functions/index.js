const functions = require('firebase-functions');
const cors = require('cors')({ 
    origin: ['https://taheralsharif.github.io', 'http://localhost:5000'],
    methods: ['POST', 'OPTIONS'],
    credentials: true
});
const { Groq } = require('groq-sdk');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

exports.getAIAnalysis = functions.https.onRequest((request, response) => {
    return cors(request, response, async () => {
        try {
            if (request.method === 'OPTIONS') {
                response.status(204).send('');
                return;
            }

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

            const prompt = `Analyze this real estate investment opportunity:
                Property Price: $${propertyData.price}
                Estimated Monthly Rent: $${estimatedRent}
                Property Type: ${propertyData.propertyType}
                Bedrooms: ${propertyData.beds}
                Bathrooms: ${propertyData.baths}
                Square Footage: ${propertyData.sqft}
                Year Built: ${propertyData.yearBuilt}
                Address: ${propertyData.address}

                Please provide a detailed analysis including:
                1. Market Analysis
                2. Investment Potential
                3. Risk Assessment
                4. Recommendations`;

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