// Initialize Supabase
initSupabase();

// Check session on page load (except for login page)
const isLoginPage = window.location.pathname.includes('login.html');

if (!isLoginPage) {
    checkSession();
}

async function checkSession() {
    if (!supabase) return;

    // If there's a hash in the URL (e.g., from email verification), let Supabase handle it first
    if (window.location.hash && window.location.hash.includes('access_token')) {
        const { data, error } = await supabase.auth.getSession();
        if (!error && data.session) {
            // Session established from link, clean URL and stay on page
            window.history.replaceState(null, null, window.location.pathname);
            return;
        }
    }

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

    // Handle Sign In / Sign Up
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';
        authMessage.classList.add('hidden');

        try {
            let error;

            if (isSignUp) {
                // Sign Up
                const result = await supabase.auth.signUp({
                    email,
                    password,
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

            // Specific error message for unverified email
            if (error.message.includes('Email not confirmed')) {
                showMessage('error', 'Please verify your email address before logging in.');
            } else {
                showMessage('error', error.message);
            }
        } finally {
            if (!isSignUp) submitBtn.textContent = 'Sign In';
            else submitBtn.textContent = 'Sign Up';
            submitBtn.disabled = false;
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
