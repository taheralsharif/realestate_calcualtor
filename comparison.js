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

// Property comparison functionality
document.getElementById('compareButton').addEventListener('click', function() {
    try {
        // Get form data for both properties
        const property1Data = getFormData('property1Form');
        const property2Data = getFormData('property2Form');
        
        // Calculate results for both properties
        const property1Results = calculateInvestment(property1Data);
        const property2Results = calculateInvestment(property2Data);
        
        // Display results
        displayResults(property1Results, property2Results);
        
        // Show comparison results section
        document.getElementById('comparisonResults').classList.remove('d-none');
        
        // Generate comparison summary
        generateComparisonSummary(property1Results, property2Results);
        
    } catch (error) {
        console.error('Error comparing properties:', error);
        alert('An error occurred while comparing the properties. Please check your input values and try again.');
    }
});

function getFormData(formId) {
    const form = document.getElementById(formId);
    if (!form) {
        throw new Error(`Form with id ${formId} not found`);
    }

    const formData = new FormData(form);
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
    
    return data;
}

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

function displayResults(property1Results, property2Results) {
    // Display Property 1 results
    const property1ResultsDiv = document.getElementById('property1Results');
    property1ResultsDiv.innerHTML = generateResultsHTML(property1Results);
    
    // Display Property 2 results
    const property2ResultsDiv = document.getElementById('property2Results');
    property2ResultsDiv.innerHTML = generateResultsHTML(property2Results);
}

function generateResultsHTML(results) {
    return `
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

function generateComparisonSummary(property1Results, property2Results) {
    const summary = document.getElementById('comparisonSummary');
    let summaryHTML = '<div class="row">';
    
    // Compare monthly profit
    const profitDiff = property2Results.monthlyProfit - property1Results.monthlyProfit;
    const profitComparison = profitDiff > 0 ? 
        `Property 2 generates $${Math.abs(profitDiff).toFixed(2)} more monthly profit` :
        `Property 1 generates $${Math.abs(profitDiff).toFixed(2)} more monthly profit`;
    
    // Compare cash-on-cash return
    const cocDiff = property2Results.cashOnCashReturn - property1Results.cashOnCashReturn;
    const cocComparison = cocDiff > 0 ?
        `Property 2 has a ${Math.abs(cocDiff).toFixed(2)}% higher cash-on-cash return` :
        `Property 1 has a ${Math.abs(cocDiff).toFixed(2)}% higher cash-on-cash return`;
    
    // Compare break-even period
    const beDiff = property2Results.breakEvenPeriod - property1Results.breakEvenPeriod;
    const beComparison = beDiff > 0 ?
        `Property 1 reaches break-even ${Math.abs(beDiff).toFixed(1)} months faster` :
        `Property 2 reaches break-even ${Math.abs(beDiff).toFixed(1)} months faster`;
    
    // Compare DSCR
    const dscrDiff = property2Results.dscr - property1Results.dscr;
    const dscrComparison = dscrDiff > 0 ?
        `Property 2 has a ${Math.abs(dscrDiff).toFixed(2)} higher DSCR` :
        `Property 1 has a ${Math.abs(dscrDiff).toFixed(2)} higher DSCR`;
    
    // Compare ROI
    const roiDiff = property2Results.roi - property1Results.roi;
    const roiComparison = roiDiff > 0 ?
        `Property 2 has a ${Math.abs(roiDiff).toFixed(2)}% higher ROI` :
        `Property 1 has a ${Math.abs(roiDiff).toFixed(2)}% higher ROI`;
    
    // Determine overall recommendation with weighted scoring
    let recommendation = '';
    const profitWeight = 0.3;
    const cocWeight = 0.25;
    const beWeight = 0.15;
    const dscrWeight = 0.15;
    const roiWeight = 0.15;
    
    const property1Score = 
        (property1Results.monthlyProfit * profitWeight) +
        (property1Results.cashOnCashReturn * cocWeight) +
        (-property1Results.breakEvenPeriod * beWeight) +
        (property1Results.dscr * dscrWeight) +
        (property1Results.roi * roiWeight);
    
    const property2Score = 
        (property2Results.monthlyProfit * profitWeight) +
        (property2Results.cashOnCashReturn * cocWeight) +
        (-property2Results.breakEvenPeriod * beWeight) +
        (property2Results.dscr * dscrWeight) +
        (property2Results.roi * roiWeight);
    
    recommendation = property1Score > property2Score ?
        'Property 1 appears to be the better investment option overall.' :
        'Property 2 appears to be the better investment option overall.';
    
    // Add risk assessment
    const riskAssessment = `
        <div class="mt-3">
            <h5>Risk Assessment</h5>
            <ul class="list-group">
                <li class="list-group-item">
                    <strong>Property 1:</strong> 
                    ${property1Results.dscr >= 1.2 ? 'Low risk' : 
                      property1Results.dscr >= 1.0 ? 'Moderate risk' : 'High risk'} 
                    (DSCR: ${property1Results.dscr.toFixed(2)})
                </li>
                <li class="list-group-item">
                    <strong>Property 2:</strong> 
                    ${property2Results.dscr >= 1.2 ? 'Low risk' : 
                      property2Results.dscr >= 1.0 ? 'Moderate risk' : 'High risk'} 
                    (DSCR: ${property2Results.dscr.toFixed(2)})
                </li>
            </ul>
        </div>
    `;
    
    summaryHTML += `
        <div class="col-md-6">
            <h5>Key Comparisons</h5>
            <ul class="list-group">
                <li class="list-group-item">${profitComparison}</li>
                <li class="list-group-item">${cocComparison}</li>
                <li class="list-group-item">${beComparison}</li>
                <li class="list-group-item">${dscrComparison}</li>
                <li class="list-group-item">${roiComparison}</li>
            </ul>
        </div>
        <div class="col-md-6">
            <h5>Recommendation</h5>
            <div class="alert alert-info">
                ${recommendation}
            </div>
            ${riskAssessment}
        </div>
    `;
    
    summaryHTML += '</div>';
    summary.innerHTML = summaryHTML;
} 