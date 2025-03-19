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
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        await auth.signInWithEmailAndPassword(email, password);
        window.location.href = 'calculator.html';
    } catch (error) {
        alert(error.message);
    }
});

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
googleLoginBtn.addEventListener('click', async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        await auth.signInWithPopup(provider);
        window.location.href = 'calculator.html';
    } catch (error) {
        alert(error.message);
    }
});

// Check authentication state
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        if (!user.emailVerified) {
            alert('Please verify your email address.');
        }
    }
}); 