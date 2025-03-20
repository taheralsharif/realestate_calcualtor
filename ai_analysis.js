// Groq API configuration
const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Function to extract data from Zillow URL
async function extractZillowData(url) {
    try {
        // Use a proxy service to bypass CORS
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        const html = await response.text();
        
        // Create a temporary DOM element to parse the HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Extract property details
        const propertyData = {
            price: extractPrice(doc),
            beds: extractBeds(doc),
            baths: extractBaths(doc),
            sqft: extractSqft(doc),
            address: extractAddress(doc),
            description: extractDescription(doc),
            yearBuilt: extractYearBuilt(doc),
            propertyType: extractPropertyType(doc)
        };
        
        return propertyData;
    } catch (error) {
        console.error('Error extracting Zillow data:', error);
        throw new Error('Failed to extract property data from Zillow');
    }
}

// Helper functions to extract specific data points
function extractPrice(doc) {
    const priceElement = doc.querySelector('[data-test="property-card-price"]');
    return priceElement ? parseInt(priceElement.textContent.replace(/[^0-9]/g, '')) : null;
}

function extractBeds(doc) {
    const bedsElement = doc.querySelector('[data-test="property-beds"]');
    return bedsElement ? parseInt(bedsElement.textContent) : null;
}

function extractBaths(doc) {
    const bathsElement = doc.querySelector('[data-test="property-baths"]');
    return bathsElement ? parseFloat(bathsElement.textContent) : null;
}

function extractSqft(doc) {
    const sqftElement = doc.querySelector('[data-test="property-sqft"]');
    return sqftElement ? parseInt(sqftElement.textContent.replace(/[^0-9]/g, '')) : null;
}

function extractAddress(doc) {
    const addressElement = doc.querySelector('[data-test="property-card-addr"]');
    return addressElement ? addressElement.textContent.trim() : null;
}

function extractDescription(doc) {
    const descElement = doc.querySelector('[data-test="property-description"]');
    return descElement ? descElement.textContent.trim() : null;
}

function extractYearBuilt(doc) {
    const yearElement = doc.querySelector('[data-test="property-year-built"]');
    return yearElement ? parseInt(yearElement.textContent) : null;
}

function extractPropertyType(doc) {
    const typeElement = doc.querySelector('[data-test="property-type"]');
    return typeElement ? typeElement.textContent.trim() : null;
}

// Function to get AI analysis of the investment
async function getAIAnalysis(propertyData, estimatedRent) {
    try {
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

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error getting AI analysis:', error);
        throw new Error('Failed to get AI analysis');
    }
}

// Function to populate calculator form with Zillow data
function populateCalculatorForm(propertyData) {
    const form = document.getElementById('calculatorForm');
    if (!form) return;

    // Map Zillow data to form fields
    const fieldMappings = {
        'propertyPrice': propertyData.price,
        'propertyName': propertyData.address
    };

    // Update form fields
    Object.entries(fieldMappings).forEach(([fieldName, value]) => {
        const input = form.querySelector(`[name="${fieldName}"]`);
        if (input && value) {
            input.value = value;
            // Trigger input event to update any dependent calculations
            input.dispatchEvent(new Event('input'));
        }
    });
}

// Export functions
window.extractZillowData = extractZillowData;
window.getAIAnalysis = getAIAnalysis;
window.populateCalculatorForm = populateCalculatorForm; 