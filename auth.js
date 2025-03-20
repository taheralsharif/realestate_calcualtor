// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAKe-KasTD0HDzAwVr-sjkghK5VUYd61jE",
    authDomain: "real-estate-calculator-3212e.firebaseapp.com",
    projectId: "real-estate-calculator-3212e",
    storageBucket: "real-estate-calculator-3212e.firebasestorage.app",
    messagingSenderId: "683636020205",
    appId: "1:683636020205:web:0c237b8b5a823d11604de4",
    measurementId: "G-2QVFVLJ4GY",
    databaseURL: "https://real-estate-calculator-3212e-default-rtdb.firebaseio.com"
};

// Initialize Firebase
let firebaseApp;
let auth;
let database;

// Initialize Firebase with retry mechanism
async function initializeFirebase() {
    try {
        // Check if Firebase is already initialized
        if (!firebase.apps.length) {
            firebaseApp = firebase.initializeApp(firebaseConfig);
            console.log('Firebase initialized successfully');
        } else {
            firebaseApp = firebase.app();
            console.log('Using existing Firebase app');
        }

        // Initialize Auth and Database
        auth = firebase.auth();
        database = firebase.database();

        // Set up auth state listener
        auth.onAuthStateChanged((user) => {
            console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
            updateUserProfile(user);
        });

        // Set up Google Sign In button if it exists
        const googleLoginBtn = document.getElementById('googleLoginBtn');
        if (googleLoginBtn) {
            googleLoginBtn.addEventListener('click', handleGoogleSignIn);
        }

        // Set up login form if it exists
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', handleEmailLogin);
        }

        // Set up signup form if it exists
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', handleEmailSignup);
        }

        return true;
    } catch (error) {
        console.error('Firebase initialization error:', error);
        showToast('Error initializing Firebase. Please refresh the page.', 'danger');
        return false;
    }
}

// Handle Google Sign In
async function handleGoogleSignIn(e) {
    e.preventDefault();
    try {
        if (!auth) {
            throw new Error('Firebase Auth not initialized');
        }
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        console.log('Google sign in successful:', result.user.email);
        showToast('Successfully logged in with Google!');
        window.location.href = 'calculator.html';
    } catch (error) {
        console.error('Google login error:', error);
        showToast('Error logging in with Google: ' + error.message, 'danger');
    }
}

// Handle Email Login
async function handleEmailLogin(e) {
    e.preventDefault();
    try {
        if (!auth) {
            throw new Error('Firebase Auth not initialized');
        }
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        if (!userCredential.user.emailVerified) {
            showToast('Please verify your email address before logging in.', 'danger');
            await auth.signOut();
            return;
        }
        console.log('Email login successful:', userCredential.user.email);
        window.location.href = 'calculator.html';
    } catch (error) {
        console.error('Email login error:', error);
        showToast(error.message, 'danger');
    }
}

// Handle Email Signup
async function handleEmailSignup(e) {
    e.preventDefault();
    try {
        if (!auth) {
            throw new Error('Firebase Auth not initialized');
        }
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;

        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user.sendEmailVerification();
        console.log('Email signup successful:', userCredential.user.email);
        showToast('Please check your email to verify your account.');
        window.location.href = 'calculator.html';
    } catch (error) {
        console.error('Email signup error:', error);
        showToast(error.message, 'danger');
    }
}

// Initialize Firebase when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    const initialized = await initializeFirebase();
    if (!initialized) {
        console.error('Failed to initialize Firebase');
    }
});

// Theme toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-bs-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-bs-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            this.innerHTML = newTheme === 'dark' ? '<i class="bi bi-sun-fill"></i>' : '<i class="bi bi-moon-fill"></i>';
        });
    }
});

// Update user profile display
function updateUserProfile(user) {
    const userDropdown = document.getElementById('userDropdown');
    const loginButton = document.getElementById('loginButton');
    const userMenuButton = document.getElementById('userMenuButton');
    const userName = document.getElementById('userName');
    const calculatorContent = document.getElementById('calculatorContent');
    
    if (user) {
        // User is signed in
        userDropdown.classList.remove('d-none');
        loginButton.classList.add('d-none');
        if (calculatorContent) calculatorContent.classList.remove('d-none');
        
        // Update user info
        userName.textContent = user.displayName || user.email;
        
        // Handle logout
        const logoutLink = document.getElementById('logoutLink');
        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                auth.signOut().then(() => {
                    window.location.href = 'login.html';
                }).catch((error) => {
                    console.error('Error signing out:', error);
                });
            });
        }
    } else {
        // User is signed out
        userDropdown.classList.add('d-none');
        loginButton.classList.remove('d-none');
        if (calculatorContent) calculatorContent.classList.add('d-none');
        userName.textContent = 'User';
        window.location.href = 'login.html';
    }
}

// Save analysis to Realtime Database
async function saveAnalysis(analysisData) {
    try {
        if (!auth || !database) {
            throw new Error('Firebase not initialized');
        }

        const user = auth.currentUser;
        if (!user) {
            throw new Error('User must be logged in to save analyses');
        }

        // Clean and validate the data before saving
        const cleanedData = {
            propertyPrice: Number(analysisData.propertyPrice) || 0,
            downPayment: Number(analysisData.downPayment) || 0,
            interestRate: Number(analysisData.interestRate) || 0,
            loanTerm: Number(analysisData.loanTerm) || 0,
            monthlyRent: Number(analysisData.monthlyRent) || 0,
            monthlyExpenses: Number(analysisData.monthlyExpenses) || 0,
            monthlyMortgage: Number(analysisData.monthlyMortgage) || 0,
            totalMonthlyCosts: Number(analysisData.totalMonthlyCosts) || 0,
            monthlyProfitLoss: Number(analysisData.monthlyProfitLoss) || 0,
            annualProfitLoss: Number(analysisData.annualProfitLoss) || 0,
            cashOnCashReturn: Number(analysisData.cashOnCashReturn) || 0,
            breakEvenPeriod: Number(analysisData.breakEvenPeriod) || 0,
            dscr: Number(analysisData.dscr) || 0,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            updatedAt: firebase.database.ServerValue.TIMESTAMP
        };

        const analysisRef = database.ref(`analyses/${user.uid}`).push();
        await analysisRef.set(cleanedData);

        showToast('Analysis saved successfully!');
    } catch (error) {
        console.error('Error saving analysis:', error);
        showToast('Error saving analysis. Please try again.', 'danger');
        throw error;
    }
}

// Get saved analyses for current user
async function getSavedAnalyses() {
    try {
        if (!auth || !database) {
            throw new Error('Firebase not initialized');
        }

        const user = auth.currentUser;
        if (!user) {
            throw new Error('User must be logged in to view analyses');
        }

        const snapshot = await database.ref(`analyses/${user.uid}`).once('value');
        const analyses = [];
        
        snapshot.forEach((childSnapshot) => {
            analyses.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });

        return analyses.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
        console.error('Error getting analyses:', error);
        showToast('Error loading analyses. Please try again.', 'danger');
        throw error;
    }
}

// Delete analysis
async function deleteAnalysis(analysisId) {
    try {
        if (!auth || !database) {
            throw new Error('Firebase not initialized');
        }

        const user = auth.currentUser;
        if (!user) {
            throw new Error('User must be logged in to delete analyses');
        }

        await database.ref(`analyses/${user.uid}/${analysisId}`).remove();
        showToast('Analysis deleted successfully!');
    } catch (error) {
        console.error('Error deleting analysis:', error);
        showToast('Error deleting analysis. Please try again.', 'danger');
        throw error;
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.querySelector('.toast');
    const toastMessage = document.getElementById('toastMessage');
    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.classList.remove('bg-success', 'bg-danger', 'bg-warning');
        toast.classList.add(`bg-${type}`);
        new bootstrap.Toast(toast).show();
    }
}

// Password Reset Function
async function resetPassword(email) {
    try {
        if (!auth) {
            throw new Error('Firebase not initialized');
        }
        await auth.sendPasswordResetEmail(email);
        showToast('Password reset email sent! Please check your inbox.');
    } catch (error) {
        showToast(error.message, 'danger');
        throw error;
    }
} 