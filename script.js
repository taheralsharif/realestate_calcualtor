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
        
        for (let [key, value] of formData.entries()) {
            data[key] = parseFloat(value);
        }
        
        // Calculate investment
        const results = calculateInvestment(data);
        
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
    // Convert percentages to decimals
    const downPaymentPercent = data.downPayment / 100;
    const interestRatePercent = data.interestRate / 100;
    const vacancyRatePercent = data.vacancyRate / 100;
    
    // Calculate loan amount
    const loanAmount = data.housePrice * (1 - downPaymentPercent);
    
    // Calculate monthly mortgage payment
    const monthlyRate = interestRatePercent / 12;
    const numberOfPayments = data.loanTerm * 12;
    const monthlyMortgage = loanAmount * 
        (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
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
    const breakEvenPeriod = downPaymentAmount / monthlyProfit;
    
    // Calculate DSCR
    const dscr = data.monthlyRent / totalMonthlyCosts;
    
    return {
        monthlyMortgage,
        monthlyPropertyTax,
        monthlyInsurance,
        monthlyMaintenance,
        monthlyVacancyCost,
        monthlyTurnoverCost,
        totalMonthlyCosts,
        monthlyProfit,
        annualProfit,
        cashOnCashReturn,
        breakEvenPeriod,
        dscr,
        monthlyRent: data.monthlyRent,
        downPaymentAmount
    };
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