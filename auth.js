// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDxGxGxGxGxGxGxGxGxGxGxGxGxGxGxGxGx",
    authDomain: "realsense-8c0c1.firebaseapp.com",
    projectId: "realsense-8c0c1",
    storageBucket: "realsense-8c0c1.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};

// Initialize Firebase
let firebaseApp;
try {
    firebaseApp = firebase.initializeApp(firebaseConfig);
} catch (error) {
    if (error.code !== 'app/duplicate-app') {
        console.error('Firebase initialization error:', error);
    }
    firebaseApp = firebase.app();
}

// Initialize Firebase services
const auth = firebaseApp.auth();
const database = firebaseApp.database();
const functions = firebaseApp.functions();

// Make services available globally
window.firebaseServices = {
    auth,
    database,
    functions
};

// Track if we're currently redirecting
let isRedirecting = false;

// Function to handle authentication state changes
function setupAuthStateListener() {
    auth.onAuthStateChanged((user) => {
        if (isRedirecting) return; // Skip if we're already redirecting
        
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        if (user) {
            // User is signed in
            console.log('User is signed in:', user.email);
            
            // Only redirect if we're on login or signup page
            if (currentPage === 'login.html' || currentPage === 'signup.html') {
                isRedirecting = true;
                window.location.replace('calculator.html');
            }
        } else {
            // User is signed out
            console.log('User is signed out');
            
            // Only redirect if we're not on login or signup page
            if (currentPage !== 'login.html' && currentPage !== 'signup.html') {
                isRedirecting = true;
                window.location.replace('login.html');
            }
        }
    });
}

// Initialize auth state listener
setupAuthStateListener();

// Email/Password Sign-In
async function signInWithEmail(email, password) {
    try {
        await auth.signInWithEmailAndPassword(email, password);
        showToast('Successfully signed in!');
    } catch (error) {
        console.error('Email sign-in error:', error);
        showToast(error.message, 'danger');
        throw error;
    }
}

// Email/Password Sign-Up
async function signUpWithEmail(email, password) {
    try {
        await auth.createUserWithEmailAndPassword(email, password);
        showToast('Account created successfully!');
    } catch (error) {
        console.error('Email sign-up error:', error);
        showToast(error.message, 'danger');
        throw error;
    }
}

// Sign Out
async function signOut() {
    try {
        await auth.signOut();
        showToast('Successfully signed out!');
        window.location.replace('login.html');
    } catch (error) {
        console.error('Sign-out error:', error);
        showToast(error.message, 'danger');
        throw error;
    }
}

// Export functions
window.firebaseServices.auth = {
    ...auth,
    signInWithEmail,
    signUpWithEmail,
    signOut
};

// Database operations
function saveAnalysis(analysisData) {
    if (!auth.currentUser) {
        showToast('Please sign in to save analyses', 'danger');
        return Promise.reject('Not authenticated');
    }

    const analysisRef = database.ref(`users/${auth.currentUser.uid}/analyses`).push();
    return analysisRef.set({
        ...analysisData,
        id: analysisRef.key,
        userId: auth.currentUser.uid,
        createdAt: Date.now()
    })
    .then(() => {
        showToast('Analysis saved successfully!');
        return analysisRef.key;
    })
    .catch((error) => {
        showToast(error.message, 'danger');
        throw error;
    });
}

function getAnalyses() {
    if (!auth.currentUser) {
        return Promise.reject('Not authenticated');
    }

    return database.ref(`users/${auth.currentUser.uid}/analyses`)
        .once('value')
        .then((snapshot) => {
            const analyses = [];
            snapshot.forEach((child) => {
                analyses.push({
                    id: child.key,
                    ...child.val()
                });
            });
            return analyses.sort((a, b) => b.createdAt - a.createdAt);
        });
}

function deleteAnalysis(analysisId) {
    if (!auth.currentUser) {
        showToast('Please sign in to delete analyses', 'danger');
        return Promise.reject('Not authenticated');
    }

    return database.ref(`users/${auth.currentUser.uid}/analyses/${analysisId}`)
        .remove()
        .then(() => {
            showToast('Analysis deleted successfully!');
        })
        .catch((error) => {
            showToast(error.message, 'danger');
            throw error;
        });
}

// Toast notification
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