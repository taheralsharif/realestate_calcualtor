// Groq API configuration
const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Function to get AI analysis using Firebase Cloud Functions
async function getAIAnalysis(propertyData, estimatedRent) {
    try {
        // Get the Firebase Functions instance
        const getAIAnalysisFunction = firebase.functions().httpsCallable('getAIAnalysis');
        
        // Call the Cloud Function
        const result = await getAIAnalysisFunction({
            propertyData,
            estimatedRent
        });
        
        return result.data.analysis;
    } catch (error) {
        console.error('Error getting AI analysis:', error);
        throw new Error('Failed to get AI analysis. Please try again later.');
    }
}

// Function to extract data from Zillow URL
async function extractZillowData(url) {
    try {
        // This is a placeholder function - in a real implementation,
        // you would need to use a proper Zillow API or web scraping service
        // that complies with Zillow's terms of service
        throw new Error('Zillow data extraction is not implemented. Please enter property details manually.');
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

    // Populate form fields with property data
    const fields = {
        'propertyName': propertyData.address || '',
        'propertyPrice': propertyData.price || '',
        'beds': propertyData.beds || '',
        'baths': propertyData.baths || '',
        'sqft': propertyData.sqft || '',
        'yearBuilt': propertyData.yearBuilt || '',
        'propertyType': propertyData.propertyType || ''
    };

    for (const [fieldName, value] of Object.entries(fields)) {
        const input = form.querySelector(`[name="${fieldName}"]`);
        if (input) {
            input.value = value;
            // Trigger input event to update any dependent fields
            input.dispatchEvent(new Event('input'));
        }
    }
}

// Export functions
window.extractZillowData = extractZillowData;
window.getAIAnalysis = getAIAnalysis;
window.populateCalculatorForm = populateCalculatorForm; 