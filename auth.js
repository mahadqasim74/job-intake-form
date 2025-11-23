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
    const resetRequestForm = document.getElementById('resetRequestForm');
    const updatePasswordForm = document.getElementById('updatePasswordForm');

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const nameInput = document.getElementById('fullName');
    const nameGroup = document.getElementById('nameGroup');

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
            nameGroup.classList.remove('hidden');
            nameInput.required = true;
            forgotPasswordLink.parentElement.classList.add('hidden');
        } else {
            authTitle.textContent = 'Sign in to access the Job Intake Form';
            submitBtn.textContent = 'Sign In';
            toggleText.innerHTML = 'Don\'t have an account? <a href="#" id="toggleAuth">Sign Up</a>';
            nameGroup.classList.add('hidden');
            nameInput.required = false;
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
        authTitle.textContent = 'Reset Password';
        authForm.classList.add('hidden');
        authFooter.classList.add('hidden');
        resetRequestForm.classList.remove('hidden');
        authMessage.classList.add('hidden');
    });

    backToLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.reload();
    });

    // Handle Sign In / Sign Up
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;
        const fullName = nameInput.value;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';
        authMessage.classList.add('hidden');

        try {
            let error;

            if (isSignUp) {
                // Sign Up with Metadata
                const result = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName
                        }
                    }
                });
                error = result.error;

                if (!error) {
                    showMessage('success', 'Account created! Please check your email to confirm.');
                }
            } else {
                // Sign In
                const result = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                error = result.error;

                if (!error) {
                    window.location.href = 'index.html';
                }
            }

            if (error) throw error;

        } catch (error) {
            console.error('Auth error:', error);
            showMessage('error', error.message);
        } finally {
            if (!isSignUp) submitBtn.textContent = 'Sign In';
            else submitBtn.textContent = 'Sign Up';
            submitBtn.disabled = false;
        }
    });

    // Handle Reset Request
    resetRequestForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('resetEmail').value;
        const btn = document.getElementById('resetBtn');

        btn.disabled = true;
        btn.textContent = 'Sending...';

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.href,
            });

            if (error) throw error;
            showMessage('success', 'Check your email for the password reset link.');

        } catch (error) {
            showMessage('error', error.message);
        } finally {
            btn.disabled = false;
            btn.textContent = 'Send Reset Link';
        }
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

// Display Greeting
async function displayGreeting() {
    const greetingElement = document.getElementById('userGreeting');
    if (!greetingElement || !supabase) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.user_metadata && user.user_metadata.full_name) {
        greetingElement.textContent = `Welcome, ${user.user_metadata.full_name}`;
    } else if (user) {
        greetingElement.textContent = `Welcome, ${user.email.split('@')[0]}`;
    }
}

// Call greeting if not on login page
if (!isLoginPage) {
    displayGreeting();
}
