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
let db;

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
        db = firebase.database();

        // Set up auth state listener
        auth.onAuthStateChanged((user) => {
            console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
            updateUserProfile(user);
        });

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
        // Ensure Firebase is initialized
        if (!auth) {
            await initializeFirebase();
        }
        
        const provider = new firebase.auth.GoogleAuthProvider();
        // Add scopes if needed
        provider.addScope('https://www.googleapis.com/auth/userinfo.email');
        provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
        
        // Set custom parameters
        provider.setCustomParameters({
            prompt: 'select_account'
        });

        console.log('Starting Google Sign In process');
        const result = await auth.signInWithPopup(provider);
        console.log('Google sign in successful:', result.user.email);
        showToast('Successfully logged in with Google!');
        
        // Let the auth state change listener handle the redirect
    } catch (error) {
        console.error('Google login error:', error);
        let errorMessage = 'Error logging in with Google. ';
        
        if (error.code === 'auth/popup-blocked') {
            errorMessage += 'Please allow popups for this site.';
        } else if (error.code === 'auth/popup-closed-by-user') {
            errorMessage += 'Login was cancelled.';
        } else if (error.code === 'auth/cancelled-popup-request') {
            errorMessage += 'Another login attempt is in progress.';
        } else {
            errorMessage += error.message;
        }
        
        showToast(errorMessage, 'danger');
    }
}

// Handle Email Login
async function handleEmailLogin(e) {
    e.preventDefault();
    try {
        if (!auth) {
            await initializeFirebase();
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
            await initializeFirebase();
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

// Update user profile display
function updateUserProfile(user) {
    console.log('updateUserProfile called with user:', user ? 'logged in' : 'logged out');
    const userDropdown = document.getElementById('userDropdown');
    const loginButton = document.getElementById('loginButton');
    const userMenuButton = document.getElementById('userMenuButton');
    const userName = document.getElementById('userName');
    const calculatorContent = document.getElementById('calculatorContent');
    
    if (user) {
        // User is signed in
        console.log('User is signed in, updating UI');
        if (userDropdown) userDropdown.classList.remove('d-none');
        if (loginButton) loginButton.classList.add('d-none');
        if (calculatorContent) calculatorContent.classList.remove('d-none');
        
        // Update user info
        if (userName) userName.textContent = user.displayName || user.email;
        
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

        // Only redirect to calculator if we're on the login page and not already redirecting
        if (window.location.pathname.includes('login.html') && !window.isRedirecting) {
            console.log('Redirecting to calculator page');
            window.isRedirecting = true;
            window.location.href = 'calculator.html';
        }
    } else {
        // User is signed out
        console.log('User is signed out, updating UI');
        if (userDropdown) userDropdown.classList.add('d-none');
        if (loginButton) loginButton.classList.remove('d-none');
        if (calculatorContent) calculatorContent.classList.add('d-none');
        if (userName) userName.textContent = 'User';
        
        // Only redirect to login if we're not already on the login page and not already redirecting
        if (!window.location.pathname.includes('login.html') && !window.isRedirecting) {
            console.log('Redirecting to login page');
            window.isRedirecting = true;
            window.location.href = 'login.html';
        }
    }
}

// Save analysis to database
async function saveAnalysis(analysisData) {
    try {
        if (!auth || !auth.currentUser) {
            throw new Error('User must be logged in to save analyses');
        }

        if (!db) {
            await initializeFirebase();
        }

        const analysisRef = db.ref(`users/${auth.currentUser.uid}/analyses`);
        const newAnalysisRef = analysisRef.push();
        
        const analysis = {
            ...analysisData,
            id: newAnalysisRef.key,
            userId: auth.currentUser.uid,
            createdAt: Date.now()
        };

        await newAnalysisRef.set(analysis);
        showToast('Analysis saved successfully!', 'success');
        return analysis.id;
    } catch (error) {
        console.error('Error saving analysis:', error);
        showToast('Error saving analysis. Please try again.', 'danger');
        throw error;
    }
}

// Get saved analyses for current user
async function getSavedAnalyses() {
    try {
        if (!auth || !auth.currentUser) {
            throw new Error('User must be logged in to view analyses');
        }

        if (!db) {
            await initializeFirebase();
        }

        const snapshot = await db.ref(`users/${auth.currentUser.uid}/analyses`).once('value');
        const analyses = [];
        
        snapshot.forEach((childSnapshot) => {
            analyses.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });

        // Sort by creation date, newest first
        return analyses.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
        console.error('Error getting analyses:', error);
        showToast('Error loading analyses. Please try again.', 'danger');
        return [];
    }
}

// Delete analysis
async function deleteAnalysis(analysisId) {
    try {
        if (!auth || !auth.currentUser) {
            throw new Error('User must be logged in to delete analyses');
        }

        if (!db) {
            await initializeFirebase();
        }

        await db.ref(`users/${auth.currentUser.uid}/analyses/${analysisId}`).remove();
        showToast('Analysis deleted successfully!', 'success');
        
        // Reload analyses list if on history page
        if (window.location.pathname.includes('history.html')) {
            loadAnalyses();
        }
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
        toast.classList.remove('bg-success', 'bg-danger');
        toast.classList.add(type === 'success' ? 'bg-success' : 'bg-danger');
        new bootstrap.Toast(toast).show();
    }
}

// Password Reset Function
async function resetPassword(email) {
    try {
        if (!auth) {
            await initializeFirebase();
        }
        await auth.sendPasswordResetEmail(email);
        showToast('Password reset email sent! Please check your inbox.');
    } catch (error) {
        showToast(error.message, 'danger');
        throw error;
    }
}

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

// Initialize Firebase when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Page loaded, initializing Firebase');
        await initializeFirebase();

        // Set up event listeners after Firebase is initialized
        const googleLoginBtn = document.getElementById('googleLoginBtn');
        if (googleLoginBtn) {
            // Remove any existing event listeners
            googleLoginBtn.replaceWith(googleLoginBtn.cloneNode(true));
            // Add the new event listener
            document.getElementById('googleLoginBtn').addEventListener('click', handleGoogleSignIn);
            console.log('Google login button event listener added');
        }

        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', handleEmailLogin);
            console.log('Email login form event listener added');
        }

        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', handleEmailSignup);
            console.log('Signup form event listener added');
        }
    } catch (error) {
        console.error('Error during initialization:', error);
        showToast('Error initializing application. Please refresh the page.', 'danger');
    }
}); 