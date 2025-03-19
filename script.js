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
        const data = {};
        
        // List of required fields
        const requiredFields = ['housePrice', 'downPayment', 'interestRate', 'loanTerm', 'monthlyRent', 
                              'propertyTax', 'insurance', 'maintenance', 'vacancyRate', 'turnoverCost'];
        
        for (const field of requiredFields) {
            const value = formData.get(field);
            if (value === null || value === '') {
                throw new Error(`Missing required field: ${field}`);
            }
            
            const numValue = parseFloat(value);
            if (isNaN(numValue)) {
                throw new Error(`Invalid number value for ${field}`);
            }
            
            data[field] = numValue;
        }
        
        // Calculate investment
        results = calculateInvestment(data);
        
        // Display results
        displayResults(results);
        
        // Show results card
        document.getElementById('resultsCard').classList.remove('d-none');
        
    } catch (error) {
        console.error('Error calculating investment:', error);
        alert('An error occurred while calculating the investment. Please check your input values and try again.');
    }
});

function calculateInvestment(data) {
    // Validate input data
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid input data');
    }

    // Validate required fields
    const requiredFields = ['housePrice', 'downPayment', 'interestRate', 'loanTerm', 'monthlyRent', 
                          'propertyTax', 'insurance', 'maintenance', 'vacancyRate', 'turnoverCost'];
    
    for (const field of requiredFields) {
        if (data[field] === undefined || isNaN(data[field])) {
            throw new Error(`Missing or invalid value for ${field}`);
        }
    }

    // Convert percentages to decimals
    const downPaymentPercent = data.downPayment / 100;
    const interestRatePercent = data.interestRate / 100;
    const vacancyRatePercent = data.vacancyRate / 100;
    
    // Calculate loan amount
    const loanAmount = data.housePrice * (1 - downPaymentPercent);
    
    // Calculate monthly mortgage payment with error handling
    let monthlyMortgage;
    try {
        const monthlyRate = interestRatePercent / 12;
        const numberOfPayments = data.loanTerm * 12;
        
        if (monthlyRate === 0) {
            monthlyMortgage = loanAmount / numberOfPayments;
        } else {
            monthlyMortgage = loanAmount * 
                (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
        }
        
        if (isNaN(monthlyMortgage) || !isFinite(monthlyMortgage)) {
            throw new Error('Invalid mortgage calculation');
        }
    } catch (error) {
        throw new Error('Error calculating mortgage payment. Please check your interest rate and loan term.');
    }
    
    // Calculate monthly costs
    const monthlyPropertyTax = data.propertyTax / 12;
    const monthlyInsurance = data.insurance / 12;
    const monthlyMaintenance = data.maintenance;
    const monthlyVacancyCost = data.monthlyRent * vacancyRatePercent;
    const monthlyTurnoverCost = data.turnoverCost / 12;
    
    const totalMonthlyCosts = monthlyMortgage + monthlyPropertyTax + 
        monthlyInsurance + monthlyMaintenance + monthlyVacancyCost + 
        monthlyTurnoverCost;
    
    // Calculate monthly profit/loss
    const monthlyProfit = data.monthlyRent - totalMonthlyCosts;
    
    // Calculate annual profit/loss
    const annualProfit = monthlyProfit * 12;
    
    // Calculate cash-on-cash return
    const downPaymentAmount = data.housePrice * downPaymentPercent;
    const cashOnCashReturn = (annualProfit / downPaymentAmount) * 100;
    
    // Calculate break-even period
    const breakEvenPeriod = monthlyProfit > 0 ? downPaymentAmount / monthlyProfit : Infinity;
    
    // Calculate DSCR
    const dscr = totalMonthlyCosts > 0 ? data.monthlyRent / totalMonthlyCosts : 0;
    
    // Calculate ROI
    const roi = (annualProfit / data.housePrice) * 100;
    
    // Return results with validation
    const results = {
        monthlyMortgage: Number(monthlyMortgage.toFixed(2)),
        monthlyPropertyTax: Number(monthlyPropertyTax.toFixed(2)),
        monthlyInsurance: Number(monthlyInsurance.toFixed(2)),
        monthlyMaintenance: Number(monthlyMaintenance.toFixed(2)),
        monthlyVacancyCost: Number(monthlyVacancyCost.toFixed(2)),
        monthlyTurnoverCost: Number(monthlyTurnoverCost.toFixed(2)),
        totalMonthlyCosts: Number(totalMonthlyCosts.toFixed(2)),
        monthlyProfit: Number(monthlyProfit.toFixed(2)),
        annualProfit: Number(annualProfit.toFixed(2)),
        cashOnCashReturn: Number(cashOnCashReturn.toFixed(2)),
        breakEvenPeriod: Number(breakEvenPeriod.toFixed(1)),
        dscr: Number(dscr.toFixed(2)),
        roi: Number(roi.toFixed(2)),
        monthlyRent: Number(data.monthlyRent.toFixed(2)),
        downPaymentAmount: Number(downPaymentAmount.toFixed(2))
    };

    // Validate results
    for (const [key, value] of Object.entries(results)) {
        if (isNaN(value)) {
            throw new Error(`Invalid calculation result for ${key}`);
        }
    }

    return results;
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
                        <td>Monthly Property Tax</td>
                        <td class="text-end">$${results.monthlyPropertyTax.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Monthly Insurance</td>
                        <td class="text-end">$${results.monthlyInsurance.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Monthly Maintenance</td>
                        <td class="text-end">$${results.monthlyMaintenance.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Monthly Vacancy Cost</td>
                        <td class="text-end">$${results.monthlyVacancyCost.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Monthly Turnover Cost</td>
                        <td class="text-end">$${results.monthlyTurnoverCost.toFixed(2)}</td>
                    </tr>
                    <tr class="table-primary">
                        <td>Total Monthly Costs</td>
                        <td class="text-end">$${results.totalMonthlyCosts.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Monthly Rental Income</td>
                        <td class="text-end">$${results.monthlyRent.toFixed(2)}</td>
                    </tr>
                    <tr class="${results.monthlyProfit >= 0 ? 'table-success' : 'table-danger'}">
                        <td>Monthly Profit/Loss</td>
                        <td class="text-end">$${results.monthlyProfit.toFixed(2)}</td>
                    </tr>
                    <tr class="${results.annualProfit >= 0 ? 'table-success' : 'table-danger'}">
                        <td>Annual Profit/Loss</td>
                        <td class="text-end">$${results.annualProfit.toFixed(2)}</td>
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
    doc.text(`Risk Assessment: ${riskLevel} Risk (DSCR: ${results.dscr.toFixed(2)})`, 14, riskY);
    
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
        ['DSCR', results.dscr.toFixed(2)]
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
        analysis += `The property generates a positive monthly cash flow of $${results.monthlyProfit.toFixed(2)}. `;
    } else {
        analysis += `The property has a negative monthly cash flow of $${Math.abs(results.monthlyProfit).toFixed(2)}. `;
    }
    
    // Annual return analysis
    analysis += `The annual profit/loss is $${results.annualProfit.toFixed(2)}. `;
    
    // Cash-on-cash return analysis
    analysis += `The cash-on-cash return is ${results.cashOnCashReturn.toFixed(2)}%. `;
    
    // Break-even analysis
    if (results.breakEvenPeriod !== Infinity) {
        analysis += `The property will break even in ${results.breakEvenPeriod.toFixed(1)} months. `;
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