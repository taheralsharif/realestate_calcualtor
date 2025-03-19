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
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

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

// Save analysis to Firestore
async function saveAnalysis(analysisData) {
    try {
        if (!auth.currentUser) {
            showToast('Please log in to save your analysis', 'danger');
            return;
        }

        const analysis = {
            ...analysisData,
            userId: auth.currentUser.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            propertyName: analysisData.propertyName || 'Unnamed Property'
        };

        await db.collection('analyses').add(analysis);
        showToast('Analysis saved successfully!');
    } catch (error) {
        console.error('Error saving analysis:', error);
        showToast('Error saving analysis. Please try again.', 'danger');
    }
}

// Get user's saved analyses
async function getSavedAnalyses() {
    try {
        if (!auth.currentUser) return [];

        const snapshot = await db.collection('analyses')
            .where('userId', '==', auth.currentUser.uid)
            .orderBy('createdAt', 'desc')
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting analyses:', error);
        showToast('Error loading analyses. Please try again.', 'danger');
        return [];
    }
}

// Delete analysis
async function deleteAnalysis(analysisId) {
    try {
        if (!auth.currentUser) {
            showToast('Please log in to delete analyses', 'danger');
            return;
        }

        await db.collection('analyses').doc(analysisId).delete();
        showToast('Analysis deleted successfully!');
    } catch (error) {
        console.error('Error deleting analysis:', error);
        showToast('Error deleting analysis. Please try again.', 'danger');
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
            const result = await firebase.auth().signInWithPopup(provider);
            if (result.user) {
                showToast('Successfully logged in with Google!');
                // Redirect to calculator page after successful login
                window.location.href = 'calculator.html';
            }
        } catch (error) {
            console.error('Google login error:', error);
            showToast('Error logging in with Google: ' + error.message, 'error');
        }
    });
}

// Update user profile in navigation
function updateUserProfile(user) {
    const userDropdown = document.getElementById('userDropdown');
    const loginButton = document.getElementById('loginButton');
    const userName = document.getElementById('userName');
    const userPhoto = document.getElementById('userPhoto');

    if (user) {
        // User is signed in
        if (userDropdown) userDropdown.classList.remove('d-none');
        if (loginButton) loginButton.classList.add('d-none');
        
        // Update user name
        if (userName) userName.textContent = user.displayName || 'User';
        
        // Update user photo
        if (userPhoto && user.photoURL) {
            userPhoto.src = user.photoURL;
        }
        
        // Add welcome message to the page
        const welcomeMessage = document.createElement('div');
        welcomeMessage.className = 'alert alert-success alert-dismissible fade show mt-3';
        welcomeMessage.innerHTML = `
            Welcome back, ${user.displayName || 'User'}! 
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(welcomeMessage, container.firstChild);
        }
    } else {
        // User is signed out
        if (userDropdown) userDropdown.classList.add('d-none');
        if (loginButton) loginButton.classList.remove('d-none');
    }
}

// Check authentication state
auth.onAuthStateChanged((user) => {
    updateUserProfile(user);
    
    // Handle logout
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            auth.signOut().then(() => {
                window.location.href = 'login.html';
            }).catch((error) => {
                console.error('Error signing out:', error);
                showToast('Error signing out. Please try again.', 'danger');
            });
        });
    }
}); 