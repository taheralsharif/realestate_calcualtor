// Theme toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    const icon = themeToggle.querySelector('i');
    
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
    
    try {
        // Get form data
        const formData = new FormData(this);
        const results = calculateInvestment(formData);
        
        // Display results
        displayResults(results);
        
        // Show results card
        document.getElementById('resultsCard').classList.remove('d-none');
        
    } catch (error) {
        console.error('Error calculating investment:', error);
        showToast(error.message, 'danger');
    }
});

// Calculate investment metrics
function calculateInvestment(data) {
    // Parse input values
    const propertyPrice = Number(data.get('propertyPrice'));
    const downPaymentPercent = Number(data.get('downPayment'));
    const interestRate = Number(data.get('interestRate'));
    const loanTerm = Number(data.get('loanTerm'));
    const monthlyRent = Number(data.get('monthlyRent'));
    const monthlyExpenses = Number(data.get('monthlyExpenses'));

    // Calculate loan details
    const downPayment = (propertyPrice * downPaymentPercent) / 100;
    const loanAmount = propertyPrice - downPayment;
    const monthlyInterestRate = (interestRate / 100) / 12;
    const numberOfPayments = loanTerm * 12;

    // Calculate monthly mortgage payment
    const monthlyMortgage = loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

    // Calculate monthly and annual metrics
    const totalMonthlyCosts = monthlyMortgage + monthlyExpenses;
    const monthlyProfitLoss = monthlyRent - totalMonthlyCosts;
    const annualProfitLoss = monthlyProfitLoss * 12;

    // Calculate investment metrics
    const cashOnCashReturn = (annualProfitLoss / downPayment) * 100;
    const dscr = monthlyRent / totalMonthlyCosts;
    const breakEvenPeriod = propertyPrice / annualProfitLoss;

    // Store results in global variable
    window.currentResults = {
        monthlyMortgage,
        monthlyExpenses,
        monthlyRent,
        totalMonthlyCosts,
        monthlyProfitLoss,
        annualProfitLoss,
        cashOnCashReturn,
        dscr,
        breakEvenPeriod
    };

    return window.currentResults;
}

function displayResults(results) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <div class="table-responsive">
            <table class="table table-hover">
                <tbody>
                    <tr>
                        <td>Monthly Mortgage Payment</td>
                        <td class="text-end">$${results.monthlyMortgage.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Monthly Expenses</td>
                        <td class="text-end">$${results.monthlyExpenses.toFixed(2)}</td>
                    </tr>
                    <tr class="table-primary">
                        <td>Total Monthly Costs</td>
                        <td class="text-end">$${results.totalMonthlyCosts.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Monthly Rental Income</td>
                        <td class="text-end">$${results.monthlyRent.toFixed(2)}</td>
                    </tr>
                    <tr class="${parseFloat(results.monthlyProfitLoss) >= 0 ? 'table-success' : 'table-danger'}">
                        <td>Monthly Profit/Loss</td>
                        <td class="text-end">$${results.monthlyProfitLoss.toFixed(2)}</td>
                    </tr>
                    <tr class="${parseFloat(results.annualProfitLoss) >= 0 ? 'table-success' : 'table-danger'}">
                        <td>Annual Profit/Loss</td>
                        <td class="text-end">$${results.annualProfitLoss.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Cash-on-Cash Return</td>
                        <td class="text-end">${results.cashOnCashReturn.toFixed(2)}%</td>
                    </tr>
                    <tr>
                        <td>Break-even Period</td>
                        <td class="text-end">${results.breakEvenPeriod.toFixed(1)} months</td>
                    </tr>
                    <tr>
                        <td>DSCR</td>
                        <td class="text-end">${results.dscr.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
    
    // Add save button after displaying results
    addSaveButton();
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
            doc.text('Real Estate Investment Analysis', 14, 15);
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
            doc.save('real-estate-analysis.pdf');
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
                ['Real Estate Investment Analysis'],
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
            XLSX.writeFile(wb, 'real-estate-analysis.xlsx');
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

// Add save button to results
function addSaveButton() {
    const resultsCard = document.getElementById('resultsCard');
    const existingSaveBtn = document.getElementById('saveAnalysisBtn');
    
    if (!existingSaveBtn) {
        const saveBtn = document.createElement('button');
        saveBtn.id = 'saveAnalysisBtn';
        saveBtn.className = 'btn btn-success mt-3';
        saveBtn.innerHTML = '<i class="bi bi-save me-2"></i>Save Analysis';
        saveBtn.onclick = saveCurrentAnalysis;
        resultsCard.appendChild(saveBtn);
    }
}

// Save current analysis
async function saveCurrentAnalysis() {
    try {
        const results = {
            propertyName: 'Investment Property',
            monthlyMortgage: parseFloat(document.querySelector('#results tr:nth-child(1) td:last-child').textContent.replace('$', '')),
            monthlyExpenses: parseFloat(document.querySelector('#results tr:nth-child(2) td:last-child').textContent.replace('$', '')),
            totalMonthlyCosts: parseFloat(document.querySelector('#results tr:nth-child(3) td:last-child').textContent.replace('$', '')),
            monthlyRent: parseFloat(document.querySelector('#results tr:nth-child(4) td:last-child').textContent.replace('$', '')),
            monthlyProfit: parseFloat(document.querySelector('#results tr:nth-child(5) td:last-child').textContent.replace('$', '')),
            annualProfit: parseFloat(document.querySelector('#results tr:nth-child(6) td:last-child').textContent.replace('$', '')),
            cashOnCashReturn: parseFloat(document.querySelector('#results tr:nth-child(7) td:last-child').textContent.replace('%', '')),
            breakEvenPeriod: parseFloat(document.querySelector('#results tr:nth-child(8) td:last-child').textContent),
            dscr: parseFloat(document.querySelector('#results tr:nth-child(9) td:last-child').textContent)
        };

        await saveAnalysis(results);
        showToast('Analysis saved successfully!');
    } catch (error) {
        console.error('Error saving analysis:', error);
        showToast('Error saving analysis. Please try again.', 'danger');
    }
} 