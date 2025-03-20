const functions = require('firebase-functions');
const fetch = require('node-fetch');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

exports.getAIAnalysis = functions.https.onCall(async (data, context) => {
    // Check if user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
    }

    try {
        // Get API key from database - updated path to match your database structure
        const snapshot = await admin.database().ref('/groqApiKey').once('value');
        const GROQ_API_KEY = snapshot.val();

        if (!GROQ_API_KEY) {
            throw new functions.https.HttpsError('failed-precondition', 'API key not configured');
        }

        const { propertyData, estimatedRent } = data;
        
        const prompt = `Analyze this real estate investment opportunity and provide a detailed verdict:

Property Details:
- Price: $${propertyData.price.toLocaleString()}
- Estimated Monthly Rent: $${estimatedRent.toLocaleString()}
- Beds: ${propertyData.beds}
- Baths: ${propertyData.baths}
- Square Feet: ${propertyData.sqft.toLocaleString()}
- Year Built: ${propertyData.yearBuilt}
- Property Type: ${propertyData.propertyType}
- Address: ${propertyData.address}

Please provide:
1. Investment Verdict (Good, Moderate, or Poor)
2. Key Strengths
3. Potential Risks
4. Market Analysis
5. Recommendations for Improvement
6. Estimated ROI Analysis

Format the response in a clear, structured way.`;

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'mixtral-8x7b-32768',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a real estate investment expert providing detailed analysis of investment opportunities.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            throw new Error('Failed to get AI analysis');
        }

        const result = await response.json();
        return { analysis: result.choices[0].message.content };
    } catch (error) {
        console.error('Error in AI analysis:', error);
        throw new functions.https.HttpsError('internal', 'Failed to get AI analysis');
    }
}); 