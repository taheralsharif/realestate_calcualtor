document.addEventListener('DOMContentLoaded', function() {
    const calculatorForm = document.getElementById('calculatorForm');
    const resultsDiv = document.getElementById('results');

    calculatorForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent form from submitting and refreshing the page
        calculateInvestment();
    });

    function calculateInvestment() {
        // Get form values
        const housePrice = parseFloat(document.getElementById('housePrice').value);
        const downPaymentPercent = parseFloat(document.getElementById('downPayment').value) / 100;
        const interestRate = parseFloat(document.getElementById('interestRate').value) / 100;
        const loanTerm = parseInt(document.getElementById('loanTerm').value);
        const monthlyRent = parseFloat(document.getElementById('monthlyRent').value);
        const annualPropertyTax = parseFloat(document.getElementById('propertyTax').value);
        const annualInsurance = parseFloat(document.getElementById('insurance').value);
        const monthlyMaintenance = parseFloat(document.getElementById('maintenance').value);

        // Calculate loan amount
        const loanAmount = housePrice * (1 - downPaymentPercent);

        // Calculate monthly mortgage payment
        const monthlyInterestRate = interestRate / 12;
        const numberOfPayments = loanTerm * 12;
        const monthlyMortgagePayment = loanAmount * 
            (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
            (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

        // Calculate monthly costs
        const monthlyPropertyTax = annualPropertyTax / 12;
        const monthlyInsurance = annualInsurance / 12;
        const totalMonthlyCosts = monthlyMortgagePayment + monthlyPropertyTax + 
                                 monthlyInsurance + monthlyMaintenance;

        // Calculate monthly profit/loss
        const monthlyProfitLoss = monthlyRent - totalMonthlyCosts;

        // Calculate ROI
        const downPaymentAmount = housePrice * downPaymentPercent;
        const annualProfitLoss = monthlyProfitLoss * 12;
        const roi = (annualProfitLoss / downPaymentAmount) * 100;

        // Update results in the UI
        document.getElementById('mortgagePayment').textContent = formatCurrency(monthlyMortgagePayment);
        document.getElementById('monthlyPropertyTax').textContent = formatCurrency(monthlyPropertyTax);
        document.getElementById('monthlyInsurance').textContent = formatCurrency(monthlyInsurance);
        document.getElementById('monthlyMaintenance').textContent = formatCurrency(monthlyMaintenance);
        document.getElementById('totalMonthlyCosts').textContent = formatCurrency(totalMonthlyCosts);
        document.getElementById('monthlyRentalIncome').textContent = formatCurrency(monthlyRent);
        document.getElementById('monthlyProfitLoss').textContent = formatCurrency(monthlyProfitLoss);

        // Generate investment analysis
        const analysis = generateInvestmentAnalysis(monthlyProfitLoss, roi);
        document.getElementById('investmentAnalysis').textContent = analysis;

        // Show results
        resultsDiv.classList.remove('d-none');
        resultsDiv.classList.add('show');
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    function generateInvestmentAnalysis(monthlyProfitLoss, roi) {
        let analysis = '';
        
        if (monthlyProfitLoss > 0) {
            analysis += 'This appears to be a good investment opportunity! ';
            if (roi > 10) {
                analysis += 'The ROI is excellent at ' + roi.toFixed(1) + '%. ';
            } else if (roi > 5) {
                analysis += 'The ROI is good at ' + roi.toFixed(1) + '%. ';
            } else {
                analysis += 'The ROI is moderate at ' + roi.toFixed(1) + '%. ';
            }
        } else {
            analysis += 'This investment may not be profitable at the current rental rate. ';
            analysis += 'The ROI is negative at ' + roi.toFixed(1) + '%. ';
        }

        if (monthlyProfitLoss > 0) {
            analysis += 'You can expect to make ' + formatCurrency(monthlyProfitLoss) + ' per month.';
        } else {
            analysis += 'You would be losing ' + formatCurrency(Math.abs(monthlyProfitLoss)) + ' per month.';
        }

        return analysis;
    }
}); 