// Groq API configuration
const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Function to get AI analysis using Firebase Cloud Functions
async function getAIAnalysis(propertyData, estimatedRent) {
    try {
        // Show loading state
        const analyzeButton = document.getElementById('analyzeWithAI');
        const aiAnalysisLoading = document.getElementById('aiAnalysisLoading');
        
        if (analyzeButton) analyzeButton.disabled = true;
        if (aiAnalysisLoading) aiAnalysisLoading.classList.remove('d-none');

        // Validate input data
        if (!propertyData || typeof propertyData !== 'object') {
            throw new Error('Invalid property data');
        }

        // Check for required fields
        const requiredFields = ['price', 'propertyType', 'beds', 'baths', 'sqft', 'yearBuilt', 'address'];
        for (const field of requiredFields) {
            if (!propertyData[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        // Validate estimated rent
        if (!estimatedRent || estimatedRent <= 0) {
            throw new Error('Please enter a valid estimated monthly rent');
        }

        // Get the current user's ID token
        if (!auth.currentUser) {
            throw new Error('Please log in to use AI analysis');
        }

        const idToken = await auth.currentUser.getIdToken();

        // Make the API call to the Cloud Function
        const response = await fetch('https://us-central1-real-estate-calculator-3212e.cloudfunctions.net/getAIAnalysis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({
                propertyData,
                estimatedRent
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to get AI analysis');
        }

        const result = await response.json();
        
        // Display the analysis in the UI
        const aiAnalysisResults = document.getElementById('aiAnalysisResults');
        const aiAnalysisContent = document.getElementById('aiAnalysisContent');
        
        if (aiAnalysisResults && aiAnalysisContent) {
            aiAnalysisResults.classList.remove('d-none');
            aiAnalysisContent.innerHTML = result.analysis || 'No analysis available';
        }

        showToast('AI analysis completed successfully!', 'success');
        return result;

    } catch (error) {
        console.error('AI Analysis error:', error);
        showToast(error.message || 'Failed to get AI analysis', 'danger');
        throw error;
    } finally {
        // Reset UI state
        const analyzeButton = document.getElementById('analyzeWithAI');
        const aiAnalysisLoading = document.getElementById('aiAnalysisLoading');
        
        if (analyzeButton) {
            analyzeButton.disabled = false;
        }
        if (aiAnalysisLoading) {
            aiAnalysisLoading.classList.add('d-none');
        }
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