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
let app;
let auth;
let database;
let isRedirecting = false;

// Initialize Firebase
function initializeFirebase() {
    if (!firebase.apps.length) {
        app = firebase.initializeApp(firebaseConfig);
    } else {
        app = firebase.app();
    }
    auth = firebase.auth();
    database = firebase.database();
}

// Initialize Firebase when the page loads
document.addEventListener('DOMContentLoaded', function() {
    if (!firebase.apps.length) {
        initializeFirebase();
        setupAuthStateListener();
    }
});

// Set up authentication state listener
function setupAuthStateListener() {
    auth.onAuthStateChanged((user) => {
        if (isRedirecting) return; // Prevent multiple redirects

        const userDropdown = document.getElementById('userDropdown');
        const loginButton = document.getElementById('loginButton');
        const userName = document.getElementById('userName');

        if (user) {
            console.log('User is signed in:', user.email);
            if (userDropdown) {
                userDropdown.style.display = 'block';
                loginButton.style.display = 'none';
                userName.textContent = user.displayName || user.email;
            }

            // If we're on the login page, redirect to calculator
            if (window.location.pathname.includes('login.html') && !isRedirecting) {
                isRedirecting = true;
                window.location.href = 'calculator.html';
            }
        } else {
            console.log('User is signed out');
            if (userDropdown) {
                userDropdown.style.display = 'none';
                loginButton.style.display = 'block';
            }

            // If we're not on the login page, redirect to login
            if (!window.location.pathname.includes('login.html') && !isRedirecting) {
                isRedirecting = true;
                window.location.href = 'login.html';
            }
        }
    });
}

// Handle Google Sign In
async function handleGoogleSignIn(e) {
    if (e) e.preventDefault();
    if (isRedirecting) return; // Prevent multiple sign-in attempts
    
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        console.log('Google sign in successful:', result.user.email);
        showToast('Successfully logged in!');
    } catch (error) {
        console.error('Google sign in error:', error);
        showToast(error.message, 'danger');
        isRedirecting = false; // Reset redirect flag if there's an error
    }
}

// Handle Email Login
async function handleEmailLogin(e) {
    e.preventDefault();
    
    try {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log('Email login successful:', userCredential.user.email);
        showToast('Successfully logged in!');
    } catch (error) {
        console.error('Email login error:', error);
        showToast(error.message, 'danger');
    }
}

// Handle Email Signup
async function handleEmailSignup(e) {
    e.preventDefault();
    
    try {
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;

        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        console.log('Email signup successful:', userCredential.user.email);
        showToast('Account created successfully!');
    } catch (error) {
        console.error('Email signup error:', error);
        showToast(error.message, 'danger');
    }
}

// Handle Logout
async function handleLogout() {
    try {
        await auth.signOut();
        showToast('Successfully logged out!');
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Logout error:', error);
        showToast(error.message, 'danger');
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

// Save analysis to database
async function saveAnalysis(analysisData) {
    try {
        if (!auth || !auth.currentUser) {
            throw new Error('User must be logged in to save analyses');
        }

        if (!database) {
            await initializeFirebase();
        }

        const analysisRef = database.ref(`users/${auth.currentUser.uid}/analyses`);
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

        if (!database) {
            await initializeFirebase();
        }

        const snapshot = await database.ref(`users/${auth.currentUser.uid}/analyses`).once('value');
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

        if (!database) {
            await initializeFirebase();
        }

        await database.ref(`users/${auth.currentUser.uid}/analyses/${analysisId}`).remove();
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

// Password Reset Function
async function resetPassword(email) {
    try {
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