// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAKe-KasTD0HDzAwVr-sjkghK5VUYd61jE",
    authDomain: "real-estate-calculator-3212e.firebaseapp.com",
    projectId: "real-estate-calculator-3212e",
    storageBucket: "real-estate-calculator-3212e.firebasestorage.app",
    messagingSenderId: "683636020205",
    appId: "1:683636020205:web:0c237b8b5a823d11604de4",
    measurementId: "G-2QVFVLJ4GY"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Initialize Firestore
const db = firebase.firestore();

// Initialize Auth
const auth = firebase.auth();

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

// Check authentication state
auth.onAuthStateChanged((user) => {
    const userDropdown = document.getElementById('userDropdown');
    const loginButton = document.getElementById('loginButton');
    const createAccountBtn = document.getElementById('createAccountBtn');
    const userName = document.getElementById('userName');
    const userMenuButton = document.getElementById('userMenuButton');
    const logoutLink = document.getElementById('logoutLink');

    if (user) {
        // User is signed in
        if (userDropdown) userDropdown.classList.remove('d-none');
        if (loginButton) loginButton.classList.add('d-none');
        if (createAccountBtn) createAccountBtn.classList.add('d-none');
        
        // Update user name in all locations
        const displayName = user.displayName || user.email;
        if (userName) userName.textContent = displayName;
        if (userMenuButton) {
            userMenuButton.innerHTML = `
                <i class="bi bi-person-circle me-2"></i>
                <span>${displayName}</span>
            `;
        }

        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                auth.signOut().then(() => {
                    window.location.href = 'index.html';
                }).catch((error) => {
                    console.error('Error signing out:', error);
                });
            });
        }
    } else {
        // User is signed out
        if (userDropdown) userDropdown.classList.add('d-none');
        if (loginButton) loginButton.classList.remove('d-none');
        if (createAccountBtn) createAccountBtn.classList.remove('d-none');
        if (userName) userName.textContent = 'User';
        if (userMenuButton) {
            userMenuButton.innerHTML = `
                <i class="bi bi-person-circle me-2"></i>
                <span>User</span>
            `;
        }
    }
});

// Save analysis to Firestore
async function saveAnalysis(analysisData) {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('User not authenticated');
        }

        const analysis = {
            ...analysisData,
            userId: user.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('analyses').add(analysis);
        return docRef.id;
    } catch (error) {
        console.error('Error saving analysis:', error);
        throw error;
    }
}

// Get saved analyses from Firestore
async function getSavedAnalyses() {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('User not authenticated');
        }

        const snapshot = await db.collection('analyses')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting analyses:', error);
        throw error;
    }
}

// Delete analysis from Firestore
async function deleteAnalysis(analysisId) {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('User not authenticated');
        }

        await db.collection('analyses').doc(analysisId).delete();
    } catch (error) {
        console.error('Error deleting analysis:', error);
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
        await auth.sendPasswordResetEmail(email);
        showToast('Password reset email sent! Please check your inbox.');
    } catch (error) {
        showToast(error.message, 'danger');
        throw error;
    }
}

// Login with email and password
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            if (!userCredential.user.emailVerified) {
                showToast('Please verify your email address before logging in.', 'danger');
                await auth.signOut();
                return;
            }
            window.location.href = 'calculator.html';
        } catch (error) {
            showToast(error.message, 'danger');
        }
    });
}

// Sign up with email and password
if (document.getElementById('signupForm')) {
    document.getElementById('signupForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;

        try {
            await auth.createUserWithEmailAndPassword(email, password);
            // Send email verification
            await auth.currentUser.sendEmailVerification();
            showToast('Please check your email to verify your account.');
            window.location.href = 'calculator.html';
        } catch (error) {
            showToast(error.message, 'danger');
        }
    });
}

// Google Sign In
if (document.getElementById('googleLoginBtn')) {
    document.getElementById('googleLoginBtn').addEventListener('click', async () => {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            await auth.signInWithPopup(provider);
            showToast('Successfully logged in with Google!');
            window.location.href = 'calculator.html';
        } catch (error) {
            console.error('Google login error:', error);
            showToast('Error logging in with Google: ' + error.message, 'danger');
        }
    });
} 