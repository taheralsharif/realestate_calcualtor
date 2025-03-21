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

// Initialize Firebase and export services
let app;
if (!firebase.apps.length) {
    app = firebase.initializeApp(firebaseConfig);
} else {
    app = firebase.app();
}

const auth = firebase.auth();
const database = firebase.database();
const functions = firebase.functions();

// Make services available globally
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDatabase = database;
window.firebaseFunctions = functions;

// Auth state observer
auth.onAuthStateChanged((user) => {
    const currentPath = window.location.pathname;
    const isLoginPage = currentPath.includes('login.html');
    
    if (user) {
        // User is signed in
        updateUI(true, user);
        if (isLoginPage) {
            window.location.href = 'calculator.html';
        }
    } else {
        // User is signed out
        updateUI(false);
        if (!isLoginPage && !currentPath.includes('signup.html')) {
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
        .then((result) => {
            showToast('Successfully signed in!');
        })
        .catch((error) => {
            showToast(error.message, 'danger');
        });
}

// Email Sign In
function signInWithEmail(email, password) {
    auth.signInWithEmailAndPassword(email, password)
        .then((result) => {
            showToast('Successfully signed in!');
        })
        .catch((error) => {
            showToast(error.message, 'danger');
        });
}

// Email Sign Up
function signUpWithEmail(email, password) {
    auth.createUserWithEmailAndPassword(email, password)
        .then((result) => {
            showToast('Account created successfully!');
        })
        .catch((error) => {
            showToast(error.message, 'danger');
        });
}

// Sign Out
function signOut() {
    auth.signOut()
        .then(() => {
            showToast('Successfully signed out!');
            window.location.href = 'login.html';
        })
        .catch((error) => {
            showToast(error.message, 'danger');
        });
}

// Password Reset
function resetPassword(email) {
    auth.sendPasswordResetEmail(email)
        .then(() => {
            showToast('Password reset email sent!');
        })
        .catch((error) => {
            showToast(error.message, 'danger');
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

// Database operations
function saveAnalysis(analysisData) {
    const user = auth.currentUser;
    if (!user) {
        showToast('Please sign in to save analyses', 'danger');
        return Promise.reject('Not authenticated');
    }

    const analysisRef = database.ref(`users/${user.uid}/analyses`).push();
    return analysisRef.set({
        ...analysisData,
        id: analysisRef.key,
        userId: user.uid,
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
    const user = auth.currentUser;
    if (!user) {
        return Promise.reject('Not authenticated');
    }

    return database.ref(`users/${user.uid}/analyses`)
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
    const user = auth.currentUser;
    if (!user) {
        showToast('Please sign in to delete analyses', 'danger');
        return Promise.reject('Not authenticated');
    }

    return database.ref(`users/${user.uid}/analyses/${analysisId}`)
        .remove()
        .then(() => {
            showToast('Analysis deleted successfully!');
        })
        .catch((error) => {
            showToast(error.message, 'danger');
            throw error;
        });
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