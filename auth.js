// Initialize Supabase
initSupabase();

// Check session on page load (except for login page)
const isLoginPage = window.location.pathname.includes('login.html');

if (!isLoginPage) {
    checkSession();
}

async function checkSession() {
    if (!supabase) return;

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        // Redirect to login if no session
        window.location.href = 'login.html';
    }
}

// Login Page Logic
if (isLoginPage) {
    const authForm = document.getElementById('authForm');

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    const submitBtn = document.getElementById('submitBtn');
    const toggleAuth = document.getElementById('toggleAuth');
    const authTitle = document.getElementById('authTitle');
    const toggleText = document.getElementById('toggleText');
    const authMessage = document.getElementById('authMessage');
    const authFooter = document.getElementById('authFooter');
    const forgotPasswordLink = document.getElementById('forgotPassword');
    const backToLoginLink = document.getElementById('backToLogin');

    let isSignUp = false;

    // Toggle between Sign In and Sign Up
    toggleAuth.addEventListener('click', (e) => {
        e.preventDefault();
        isSignUp = !isSignUp;

        if (isSignUp) {
            authTitle.textContent = 'Create an account';
            submitBtn.textContent = 'Sign Up';
            toggleText.innerHTML = 'Already have an account? <a href="#" id="toggleAuth">Sign In</a>';
            forgotPasswordLink.parentElement.classList.add('hidden');
        } else {
            authTitle.textContent = 'Sign in to access the Job Intake Form';
            submitBtn.textContent = 'Sign In';
            toggleText.innerHTML = 'Don\'t have an account? <a href="#" id="toggleAuth">Sign Up</a>';
            forgotPasswordLink.parentElement.classList.remove('hidden');
        }

        // Re-attach event listener
        document.getElementById('toggleAuth').addEventListener('click', (e) => {
            toggleAuth.click();
        });

        authMessage.classList.add('hidden');
    });

    // Forgot Password Flow
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        alert("Please contact the administrator to reset your password.");
    });

    backToLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.reload();
    });



    function showMessage(type, text) {
        authMessage.textContent = text;
        authMessage.className = `auth-message ${type}`;
        authMessage.classList.remove('hidden');
    }
}

// Logout Function
async function logout() {
    if (!supabase) return;

    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Error signing out:', error);
    } else {
        window.location.href = 'login.html';
    }
}
