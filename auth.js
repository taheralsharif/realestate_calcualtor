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
if (document.getElementById('googleLogin')) {
    document.getElementById('googleLogin').addEventListener('click', async () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        try {
            const result = await auth.signInWithPopup(provider);
            if (!result.user.emailVerified) {
                await result.user.sendEmailVerification();
                showToast('Please verify your email address before continuing.', 'danger');
                await auth.signOut();
                return;
            }
            window.location.href = 'calculator.html';
        } catch (error) {
            console.error('Google Sign In Error:', error);
            if (error.code === 'auth/unauthorized-domain') {
                showToast('This domain is not authorized for Google sign-in. Please contact support.', 'danger');
            } else {
                showToast(error.message, 'danger');
            }
        }
    });
}

// Check authentication state
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        if (!user.emailVerified) {
            showToast('Please verify your email address before continuing.', 'danger');
            auth.signOut();
            return;
        }
        
        // Update UI for logged-in users
        const userDropdown = document.getElementById('userDropdown');
        const loginButton = document.getElementById('loginButton');
        const userMenuButton = document.getElementById('userMenuButton');
        const userPhoto = document.getElementById('userPhoto');
        const userName = document.getElementById('userName');
        const calculatorContent = document.getElementById('calculatorContent');
        
        if (userDropdown) userDropdown.classList.remove('d-none');
        if (loginButton) loginButton.classList.add('d-none');
        if (calculatorContent) calculatorContent.classList.remove('d-none');
        
        if (userPhoto) userPhoto.src = user.photoURL || 'https://via.placeholder.com/32';
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
                    showToast('Error signing out. Please try again.', 'danger');
                });
            });
        }
    } else {
        // User is signed out
        const userDropdown = document.getElementById('userDropdown');
        const loginButton = document.getElementById('loginButton');
        const calculatorContent = document.getElementById('calculatorContent');
        
        if (userDropdown) userDropdown.classList.add('d-none');
        if (loginButton) loginButton.classList.remove('d-none');
        if (calculatorContent) calculatorContent.classList.add('d-none');
        
        // Redirect to login if trying to access protected pages
        if (window.location.pathname.includes('calculator.html') || 
            window.location.pathname.includes('comparison.html')) {
            window.location.href = 'login.html';
        }
    }
}); 