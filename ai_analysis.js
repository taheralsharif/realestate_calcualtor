// Groq API configuration
const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Function to get AI analysis using Firebase Cloud Functions
async function getAIAnalysis(propertyData, estimatedRent) {
    try {
        // Validate input data
        if (!propertyData || !estimatedRent) {
            throw new Error('Missing required property data or estimated rent');
        }

        // Ensure all numeric values are valid
        const validatedData = {
            price: Number(propertyData.price) || 0,
            beds: Number(propertyData.beds) || 0,
            baths: Number(propertyData.baths) || 0,
            sqft: Number(propertyData.sqft) || 0,
            yearBuilt: Number(propertyData.yearBuilt) || 0,
            propertyType: propertyData.propertyType || 'Unknown',
            address: propertyData.address || 'Unknown Address'
        };

        // Get the Firebase Functions instance
        const getAIAnalysisFunction = firebase.functions().httpsCallable('getAIAnalysis');
        
        // Call the Cloud Function with validated data
        const result = await getAIAnalysisFunction({
            propertyData: validatedData,
            estimatedRent: Number(estimatedRent) || 0
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
        // Basic validation for Zillow URL
        if (!url.includes('zillow.com')) {
            throw new Error('Please enter a valid Zillow URL');
        }

        // For now, we'll return a placeholder object
        // In a real implementation, you would use Zillow's API or a proper scraping service
        return {
            price: 0,
            beds: 0,
            baths: 0,
            sqft: 0,
            yearBuilt: 0,
            propertyType: 'Single Family',
            address: 'Please enter property details manually'
        };
    } catch (error) {
        console.error('Error extracting Zillow data:', error);
        throw new Error('Please enter property details manually');
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