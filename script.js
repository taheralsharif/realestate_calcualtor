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

// Calculator functionality
document.getElementById('calculatorForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    try {
        // Get form data
        const formData = new FormData(this);
        const data = {
            propertyPrice: parseFloat(formData.get('propertyPrice')),
            downPayment: parseFloat(formData.get('downPayment')),
            interestRate: parseFloat(formData.get('interestRate')),
            loanTerm: parseInt(formData.get('loanTerm')),
            monthlyRent: parseFloat(formData.get('monthlyRent')),
            monthlyExpenses: parseFloat(formData.get('monthlyExpenses'))
        };
        
        // Validate inputs
        for (const [key, value] of Object.entries(data)) {
            if (isNaN(value)) {
                throw new Error(`Please enter a valid number for ${key}`);
            }
        }
        
        // Calculate investment
        const results = calculateInvestment(data);
        
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
    try {
        // Convert string inputs to numbers
        const propertyPrice = data.propertyPrice;
        const downPayment = data.downPayment;
        const interestRate = data.interestRate / 100;
        const loanTerm = data.loanTerm;
        const monthlyRent = data.monthlyRent;
        const monthlyExpenses = data.monthlyExpenses;

        // Calculate monthly mortgage payment
        const loanAmount = propertyPrice - downPayment;
        const monthlyRate = interestRate / 12;
        const numberOfPayments = loanTerm * 12;
        const monthlyMortgage = loanAmount * 
            (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
            (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

        // Calculate total monthly costs
        const totalMonthlyCosts = monthlyMortgage + monthlyExpenses;

        // Calculate monthly profit/loss
        const monthlyProfit = monthlyRent - totalMonthlyCosts;

        // Calculate annual profit/loss
        const annualProfit = monthlyProfit * 12;

        // Calculate cash-on-cash return
        const cashOnCashReturn = (annualProfit / downPayment) * 100;

        // Calculate break-even period (in months)
        const breakEvenPeriod = downPayment / monthlyProfit;

        // Calculate DSCR (Debt Service Coverage Ratio)
        const dscr = monthlyRent / totalMonthlyCosts;

        return {
            monthlyMortgage: monthlyMortgage.toFixed(2),
            totalMonthlyCosts: totalMonthlyCosts.toFixed(2),
            monthlyProfit: monthlyProfit.toFixed(2),
            annualProfit: annualProfit.toFixed(2),
            cashOnCashReturn: cashOnCashReturn.toFixed(2),
            breakEvenPeriod: breakEvenPeriod.toFixed(1),
            dscr: dscr.toFixed(2),
            monthlyRent: monthlyRent.toFixed(2)
        };
    } catch (error) {
        console.error('Calculation error:', error);
        throw new Error('An error occurred while calculating the investment. Please check your input values and try again.');
    }
}

function displayResults(results) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <div class="table-responsive">
            <table class="table table-hover">
                <tbody>
                    <tr>
                        <td>Monthly Mortgage Payment</td>
                        <td class="text-end">$${results.monthlyMortgage}</td>
                    </tr>
                    <tr>
                        <td>Monthly Expenses</td>
                        <td class="text-end">$${results.monthlyExpenses}</td>
                    </tr>
                    <tr class="table-primary">
                        <td>Total Monthly Costs</td>
                        <td class="text-end">$${results.totalMonthlyCosts}</td>
                    </tr>
                    <tr>
                        <td>Monthly Rental Income</td>
                        <td class="text-end">$${results.monthlyRent}</td>
                    </tr>
                    <tr class="${parseFloat(results.monthlyProfit) >= 0 ? 'table-success' : 'table-danger'}">
                        <td>Monthly Profit/Loss</td>
                        <td class="text-end">$${results.monthlyProfit}</td>
                    </tr>
                    <tr class="${parseFloat(results.annualProfit) >= 0 ? 'table-success' : 'table-danger'}">
                        <td>Annual Profit/Loss</td>
                        <td class="text-end">$${results.annualProfit}</td>
                    </tr>
                    <tr>
                        <td>Cash-on-Cash Return</td>
                        <td class="text-end">${results.cashOnCashReturn}%</td>
                    </tr>
                    <tr>
                        <td>Break-even Period</td>
                        <td class="text-end">${results.breakEvenPeriod} months</td>
                    </tr>
                    <tr>
                        <td>DSCR</td>
                        <td class="text-end">${results.dscr}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
    
    // Add save button after displaying results
    addSaveButton();
}

// Download functionality
document.getElementById('downloadPDF').addEventListener('click', function() {
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
    const riskLevel = results.dscr >= 1.2 ? 'Low' : results.dscr >= 1.0 ? 'Moderate' : 'High';
    const riskY = doc.lastAutoTable.finalY + 10;
    doc.text(`Risk Assessment: ${riskLevel} Risk (DSCR: ${results.dscr})`, 14, riskY);
    
    // Add investment analysis
    const analysisY = riskY + 10;
    doc.text('Investment Analysis:', 14, analysisY);
    doc.setFontSize(10);
    const analysis = generateInvestmentAnalysis(results);
    doc.text(analysis, 14, analysisY + 7);
    
    // Save the PDF
    doc.save('real-estate-analysis.pdf');
});

document.getElementById('downloadExcel').addEventListener('click', function() {
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
    const riskLevel = results.dscr >= 1.2 ? 'Low' : results.dscr >= 1.0 ? 'Moderate' : 'High';
    XLSX.utils.sheet_add_aoa(ws, [
        [''],
        ['Risk Assessment'],
        ['Risk Level', riskLevel],
        ['DSCR', results.dscr]
    ], { origin: -1 });
    
    // Add investment analysis
    XLSX.utils.sheet_add_aoa(ws, [
        [''],
        ['Investment Analysis'],
        [generateInvestmentAnalysis(results)]
    ], { origin: -1 });
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Analysis');
    
    // Save the Excel file
    XLSX.writeFile(wb, 'real-estate-analysis.xlsx');
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