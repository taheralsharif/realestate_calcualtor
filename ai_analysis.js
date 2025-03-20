// Groq API configuration
const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Function to get AI analysis
async function getAIAnalysis(propertyData, estimatedRent) {
    try {
        // Get the current user's ID token
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('User must be logged in to get AI analysis');
        }

        const idToken = await user.getIdToken();

        // Make the request to the Cloud Function
        const response = await fetch('https://us-central1-real-estate-calculator-3212e.cloudfunctions.net/getAIAnalysis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`,
                'Accept': 'application/json'
            },
            mode: 'cors',
            body: JSON.stringify({
                propertyData,
                estimatedRent
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to get AI analysis: ${errorText}`);
        }

        const data = await response.json();
        if (!data.analysis) {
            throw new Error('No analysis data received');
        }
        return data.analysis;
    } catch (error) {
        console.error('Error getting AI analysis:', error);
        throw new Error('Failed to get AI analysis. Please try again later.');
    }
}

// Function to extract data from Zillow URL
async function extractZillowData(url) {
    try {
        // Validate URL
        if (!url.includes('zillow.com')) {
            throw new Error('Please enter a valid Zillow URL');
        }

        // For now, return placeholder data
        // In a real implementation, you would scrape the Zillow page or use their API
        return {
            price: 500000,
            beds: 3,
            baths: 2,
            sqft: 2000,
            yearBuilt: 2020,
            propertyType: 'Single Family',
            address: '123 Main St, City, State'
        };
    } catch (error) {
        console.error('Error extracting Zillow data:', error);
        throw error;
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

// Function to populate calculator form with property data
function populateCalculatorForm(propertyData) {
    const form = document.getElementById('calculatorForm');
    if (!form) return;

    // Update form fields with property data
    form.querySelector('[name="propertyPrice"]').value = propertyData.price;
    form.querySelector('[name="beds"]').value = propertyData.beds;
    form.querySelector('[name="baths"]').value = propertyData.baths;
    form.querySelector('[name="sqft"]').value = propertyData.sqft;
    form.querySelector('[name="yearBuilt"]').value = propertyData.yearBuilt;
    form.querySelector('[name="propertyType"]').value = propertyData.propertyType;
    form.querySelector('[name="address"]').value = propertyData.address;
}

// Export functions
window.extractZillowData = extractZillowData;
window.getAIAnalysis = getAIAnalysis;
window.populateCalculatorForm = populateCalculatorForm; 