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
    const updatePasswordForm = document.getElementById('updatePasswordForm');

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

    // Check for Password Reset Hash
    if (window.location.hash.includes('type=recovery')) {
        authTitle.textContent = 'Set New Password';
        authForm.classList.add('hidden');
        authFooter.classList.add('hidden');
        updatePasswordForm.classList.remove('hidden');
    }

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

    // Handle Update Password
    updatePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPassword = document.getElementById('newPassword').value;
        const btn = document.getElementById('updatePasswordBtn');

        btn.disabled = true;
        btn.textContent = 'Updating...';

        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });

            if (error) throw error;

            showMessage('success', 'Password updated! Redirecting...');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);

        } catch (error) {
            showMessage('error', error.message);
            btn.disabled = false;
            btn.textContent = 'Update Password';
        }
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
