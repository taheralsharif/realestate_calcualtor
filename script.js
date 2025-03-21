// Theme toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return; // Exit if theme toggle not found
    
    const icon = themeToggle.querySelector('i');
    if (!icon) return; // Exit if icon not found
    
    // Set initial icon
    updateThemeIcon();
    
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-bs-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-bs-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon();
    });
    
    function updateThemeIcon() {
        const currentTheme = document.documentElement.getAttribute('data-bs-theme');
        icon.className = currentTheme === 'light' ? 'bi bi-moon-fill' : 'bi bi-sun-fill';
    }
});

// Global variable to store current results
window.currentResults = null;

// Calculator functionality
document.getElementById('calculatorForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateInvestment();
});

function calculateInvestment() {
    try {
        // Get form values
        const propertyPrice = parseFloat(document.getElementById('propertyPrice').value);
        const downPaymentPercent = parseFloat(document.getElementById('downPayment').value) / 100;
        const interestRate = parseFloat(document.getElementById('interestRate').value) / 100;
        const loanTerm = parseInt(document.getElementById('loanTerm').value);
        const monthlyRent = parseFloat(document.getElementById('estimatedRent').value);
        const monthlyExpenses = parseFloat(document.getElementById('monthlyExpenses').value);
        const insurance = parseFloat(document.getElementById('insurance').value) || 0;
        const pmi = parseFloat(document.getElementById('pmi').value) || 0;

        // Calculate loan amount
        const loanAmount = propertyPrice * (1 - downPaymentPercent);
        
        // Calculate monthly mortgage payment
        const monthlyRate = interestRate / 12;
        const numberOfPayments = loanTerm * 12;
        const mortgagePayment = loanAmount * 
            (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
            (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

        // Calculate total monthly costs
        const totalMonthlyCosts = mortgagePayment + monthlyExpenses + insurance + pmi;

        // Calculate monthly profit/loss
        const monthlyProfitLoss = monthlyRent - totalMonthlyCosts;

        // Calculate annual profit/loss
        const annualProfitLoss = monthlyProfitLoss * 12;

        // Calculate cash-on-cash return
        const downPaymentAmount = propertyPrice * downPaymentPercent;
        const annualCashFlow = monthlyProfitLoss * 12;
        const cashOnCashReturn = (annualCashFlow / downPaymentAmount) * 100;

        // Calculate DSCR (Debt Service Coverage Ratio)
        const dscr = monthlyRent / totalMonthlyCosts;

        // Store results for saving
        window.currentResults = {
            mortgagePayment,
            totalMonthlyCosts,
            monthlyProfitLoss,
            annualProfitLoss,
            cashOnCashReturn,
            dscr,
            insurance,
            pmi
        };

        // Display results
        displayResults(window.currentResults);
    } catch (error) {
        console.error('Error calculating investment:', error);
        showToast('Error calculating investment. Please check your inputs.', 'error');
    }
}

function displayResults(results) {
    const resultsCard = document.getElementById('results');
    if (!resultsCard) {
        console.error('Results card not found');
        return;
    }

    // Format numbers
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const formatPercent = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'percent',
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        }).format(value / 100);
    };

    // Update results display
    document.getElementById('mortgagePayment').textContent = formatCurrency(results.mortgagePayment);
    document.getElementById('totalMonthlyCosts').textContent = formatCurrency(results.totalMonthlyCosts);
    document.getElementById('monthlyProfit').textContent = formatCurrency(results.monthlyProfitLoss);
    document.getElementById('annualProfit').textContent = formatCurrency(results.annualProfitLoss);
    document.getElementById('cashOnCashReturn').textContent = formatPercent(results.cashOnCashReturn);
    document.getElementById('dscr').textContent = results.dscr.toFixed(2);

    // Update investment verdict
    const verdictElement = document.getElementById('investmentVerdict');
    if (verdictElement) {
        if (results.monthlyProfitLoss > 0) {
            verdictElement.textContent = 'Good Investment';
            verdictElement.className = 'text-success';
        } else {
            verdictElement.textContent = 'Poor Investment';
            verdictElement.className = 'text-danger';
        }
    }

    // Show results card
    resultsCard.classList.remove('d-none');

    // Add save button if not already present
    if (!document.querySelector('#results .btn-success')) {
        const saveButton = document.createElement('button');
        saveButton.className = 'btn btn-success';
        saveButton.innerHTML = '<i class="bi bi-save me-2"></i>Save Analysis';
        saveButton.onclick = saveCurrentAnalysis;
        resultsCard.querySelector('.card-body').appendChild(saveButton);
    }
}

// Download functionality
document.addEventListener('DOMContentLoaded', function() {
    const downloadPDFBtn = document.getElementById('downloadPDF');
    const downloadExcelBtn = document.getElementById('downloadExcel');

    if (downloadPDFBtn) {
        downloadPDFBtn.addEventListener('click', function() {
            if (!window.currentResults) {
                showToast('Please calculate results first', 'warning');
                return;
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Add title
            doc.setFontSize(16);
            doc.text('RealSense Investment Analysis', 14, 15);
            doc.setFontSize(12);
            
            // Get the results table
            const table = document.querySelector('#results table');
            const rows = Array.from(table.querySelectorAll('tr')).map(row => 
                Array.from(row.querySelectorAll('td')).map(cell => cell.textContent)
            );
            
            // Add the table
            doc.autoTable({
                head: [['Metric', 'Value']],
                body: rows,
                startY: 25,
                theme: 'grid',
                styles: { fontSize: 10 },
                headStyles: { fillColor: [66, 139, 202] }
            });
            
            // Add risk assessment
            const riskLevel = window.currentResults.dscr >= 1.2 ? 'Low' : window.currentResults.dscr >= 1.0 ? 'Moderate' : 'High';
            const riskY = doc.lastAutoTable.finalY + 10;
            doc.text(`Risk Assessment: ${riskLevel} Risk (DSCR: ${window.currentResults.dscr})`, 14, riskY);
            
            // Add investment analysis
            const analysisY = riskY + 10;
            doc.text('Investment Analysis:', 14, analysisY);
            doc.setFontSize(10);
            const analysis = generateInvestmentAnalysis(window.currentResults);
            doc.text(analysis, 14, analysisY + 7);
            
            // Save the PDF
            doc.save('realsense-analysis.pdf');
            showToast('PDF downloaded successfully!', 'success');
        });
    }

    if (downloadExcelBtn) {
        downloadExcelBtn.addEventListener('click', function() {
            if (!currentResults) {
                showToast('Please calculate results first', 'warning');
                return;
            }

            // Create workbook
            const wb = XLSX.utils.book_new();
            
            // Get the results table
            const table = document.querySelector('#results table');
            const rows = Array.from(table.querySelectorAll('tr')).map(row => 
                Array.from(row.querySelectorAll('td')).map(cell => cell.textContent)
            );
            
            // Create worksheet
            const ws = XLSX.utils.aoa_to_sheet([
                ['RealSense Investment Analysis'],
                [''],
                ['Metric', 'Value'],
                ...rows
            ]);
            
            // Add risk assessment
            const riskLevel = currentResults.dscr >= 1.2 ? 'Low' : currentResults.dscr >= 1.0 ? 'Moderate' : 'High';
            XLSX.utils.sheet_add_aoa(ws, [
                [''],
                ['Risk Assessment'],
                ['Risk Level', riskLevel],
                ['DSCR', currentResults.dscr]
            ], { origin: -1 });
            
            // Add investment analysis
            XLSX.utils.sheet_add_aoa(ws, [
                [''],
                ['Investment Analysis'],
                [generateInvestmentAnalysis(currentResults)]
            ], { origin: -1 });
            
            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Analysis');
            
            // Save the Excel file
            XLSX.writeFile(wb, 'realsense-analysis.xlsx');
            showToast('Excel file downloaded successfully!', 'success');
        });
    }
});

function generateInvestmentAnalysis(results) {
    let analysis = '';
    
    // Monthly cash flow analysis
    if (results.monthlyProfit >= 0) {
        analysis += `The property generates a positive monthly cash flow of $${results.monthlyProfit}. `;
    } else {
        analysis += `The property has a negative monthly cash flow of $${Math.abs(results.monthlyProfit)}. `;
    }
    
    // Annual return analysis
    analysis += `The annual profit/loss is $${results.annualProfit}. `;
    
    // Cash-on-cash return analysis
    analysis += `The cash-on-cash return is ${results.cashOnCashReturn}%. `;
    
    // Break-even analysis
    if (results.breakEvenPeriod !== Infinity) {
        analysis += `The property will break even in ${results.breakEvenPeriod} months. `;
    } else {
        analysis += 'The property will not break even at current rates. ';
    }
    
    // DSCR analysis
    if (results.dscr >= 1.2) {
        analysis += 'The DSCR indicates a low-risk investment.';
    } else if (results.dscr >= 1.0) {
        analysis += 'The DSCR indicates a moderate-risk investment.';
    } else {
        analysis += 'The DSCR indicates a high-risk investment.';
    }
    
    return analysis;
}

// Store results globally for download functions
let results = null;

// Function to add save button to results
function addSaveButton() {
    const resultsCard = document.querySelector('#results .card-body');
    if (!resultsCard) return; // Exit if results card not found

    // Remove existing save button if it exists
    const existingButton = resultsCard.querySelector('.save-analysis-btn');
    if (existingButton) {
        existingButton.remove();
    }

    // Create new save button
    const saveButton = document.createElement('button');
    saveButton.className = 'btn btn-success save-analysis-btn';
    saveButton.innerHTML = '<i class="bi bi-save me-2"></i>Save Analysis';
    saveButton.onclick = saveCurrentAnalysis;
    
    // Add button to results card
    resultsCard.appendChild(saveButton);
}

// Save current analysis
async function saveCurrentAnalysis() {
    try {
        if (!auth || !auth.currentUser) {
            showToast('Please log in to save analyses', 'danger');
            return;
        }

        const formData = new FormData(document.getElementById('calculatorForm'));
        const currentResults = window.currentResults;

        if (!currentResults) {
            showToast('Please calculate results before saving', 'danger');
            return;
        }

        const data = {
            propertyName: formData.get('propertyName') || 'Unnamed Property',
            propertyPrice: Number(formData.get('propertyPrice')),
            downPayment: Number(formData.get('downPayment')),
            interestRate: Number(formData.get('interestRate')),
            loanTerm: Number(formData.get('loanTerm')),
            monthlyRent: Number(formData.get('estimatedRent')),
            monthlyExpenses: Number(formData.get('monthlyExpenses')),
            insurance: Number(formData.get('insurance')),
            pmi: Number(formData.get('pmi')),
            mortgagePayment: currentResults.mortgagePayment,
            totalMonthlyCosts: currentResults.totalMonthlyCosts,
            monthlyProfit: currentResults.monthlyProfitLoss,
            annualProfit: currentResults.annualProfitLoss,
            cashOnCashReturn: currentResults.cashOnCashReturn,
            dscr: currentResults.dscr,
            type: 'calculator',
            createdAt: new Date().toISOString()
        };

        // Save to Firebase
        const user = auth.currentUser;
        const analysesRef = firebase.database().ref(`analyses/${user.uid}`);
        const newAnalysisRef = analysesRef.push();
        await newAnalysisRef.set(data);

        showToast('Analysis saved successfully!', 'success');
    } catch (error) {
        console.error('Error saving analysis:', error);
        showToast('Error saving analysis', 'danger');
    }
} 