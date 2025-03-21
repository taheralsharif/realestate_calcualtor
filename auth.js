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
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const database = firebase.database();

// Auth state observer
auth.onAuthStateChanged((user) => {
    const currentPath = window.location.pathname;
    const isLoginPage = currentPath.includes('login.html');
    const isSignupPage = currentPath.includes('signup.html');
    const isPublicPage = currentPath.includes('index.html');
    
    if (user) {
        // User is signed in
        updateUI(true, user);
        if (isLoginPage || isSignupPage) {
            window.location.href = 'calculator.html';
        }
    } else {
        // User is signed out
        updateUI(false);
        if (!isLoginPage && !isSignupPage && !isPublicPage) {
            window.location.href = 'login.html';
        }
    }
});

// Update UI based on auth state
function updateUI(isLoggedIn, user = null) {
    const userDropdown = document.getElementById('userDropdown');
    const loginButton = document.getElementById('loginButton');
    const userName = document.getElementById('userName');

    if (!userDropdown || !loginButton) return;

    if (isLoggedIn && user) {
        userDropdown.style.display = 'block';
        loginButton.style.display = 'none';
        if (userName) {
            userName.textContent = user.displayName || user.email;
        }
    } else {
        userDropdown.style.display = 'none';
        loginButton.style.display = 'block';
    }
}

// Google Sign In
function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then(() => {
            showToast('Successfully signed in!');
        })
        .catch((error) => {
            console.error('Google sign in error:', error);
            showToast(error.message, 'danger');
        });
}

// Email Sign In
function signInWithEmail(email, password) {
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            showToast('Successfully signed in!');
        })
        .catch((error) => {
            console.error('Email sign in error:', error);
            showToast(error.message, 'danger');
        });
}

// Email Sign Up
function signUpWithEmail(email, password) {
    auth.createUserWithEmailAndPassword(email, password)
        .then(() => {
            showToast('Account created successfully!');
        })
        .catch((error) => {
            console.error('Email sign up error:', error);
            showToast(error.message, 'danger');
        });
}

// Sign Out
function signOut() {
    auth.signOut()
        .then(() => {
            showToast('Successfully signed out!');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        })
        .catch((error) => {
            console.error('Sign out error:', error);
            showToast(error.message, 'danger');
        });
}

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

// Make functions available globally
window.signInWithGoogle = signInWithGoogle;
window.signInWithEmail = signInWithEmail;
window.signUpWithEmail = signUpWithEmail;
window.signOut = signOut;
window.saveAnalysis = saveAnalysis;
window.getAnalyses = getAnalyses;
window.deleteAnalysis = deleteAnalysis;

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