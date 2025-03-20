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
            address: propertyData.address || 'Unknown Address',
            estimatedRent: Number(estimatedRent) || 0
        };

        // Call Firebase Cloud Function
        const getAIAnalysis = firebase.functions().httpsCallable('getAIAnalysis');
        const result = await getAIAnalysis({
            propertyData: validatedData,
            estimatedRent: validatedData.estimatedRent
        });

        return result.data;
    } catch (error) {
        console.error('Error getting AI analysis:', error);
        throw new Error('Failed to get AI analysis. Please try again.');
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
    try {
        // Update form fields
        document.getElementById('propertyPrice').value = propertyData.price || '';
        document.getElementById('beds').value = propertyData.beds || '';
        document.getElementById('baths').value = propertyData.baths || '';
        document.getElementById('sqft').value = propertyData.sqft || '';
        document.getElementById('yearBuilt').value = propertyData.yearBuilt || '';
        document.getElementById('propertyType').value = propertyData.propertyType || '';
        document.getElementById('address').value = propertyData.address || '';
        
        // Show success message
        showToast('Property data imported successfully!', 'success');
    } catch (error) {
        console.error('Error populating form:', error);
        showToast('Error populating form. Please try again.', 'danger');
    }
}

// Function to show toast notifications
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
    toastContainer.appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

// Function to create toast container if it doesn't exist
function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(container);
    return container;
}

// Export functions
window.extractZillowData = extractZillowData;
window.getAIAnalysis = getAIAnalysis;
window.populateCalculatorForm = populateCalculatorForm; 