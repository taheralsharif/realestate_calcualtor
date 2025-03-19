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

// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const googleLoginBtn = document.getElementById('googleLogin');

// Password Reset Function
async function resetPassword(email) {
    try {
        await auth.sendPasswordResetEmail(email);
        alert('Password reset email sent! Please check your inbox.');
    } catch (error) {
        alert(error.message);
    }
}

// Login with email and password
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            if (!userCredential.user.emailVerified) {
                alert('Please verify your email address before logging in.');
                await auth.signOut();
                return;
            }
            window.location.href = 'calculator.html';
        } catch (error) {
            alert(error.message);
        }
    });
}

// Sign up with email and password
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    try {
        await auth.createUserWithEmailAndPassword(email, password);
        // Send email verification
        await auth.currentUser.sendEmailVerification();
        alert('Please check your email to verify your account.');
        window.location.href = 'calculator.html';
    } catch (error) {
        alert(error.message);
    }
});

// Google Sign In
if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        try {
            const result = await auth.signInWithPopup(provider);
            if (!result.user.emailVerified) {
                await result.user.sendEmailVerification();
                alert('Please verify your email address before continuing.');
                await auth.signOut();
                return;
            }
            window.location.href = 'calculator.html';
        } catch (error) {
            alert(error.message);
        }
    });
}

// Check authentication state
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        if (!user.emailVerified) {
            alert('Please verify your email address before continuing.');
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