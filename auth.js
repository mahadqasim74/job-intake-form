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

    let isSignUp = false;

    // Toggle between Sign In and Sign Up
    toggleAuth.addEventListener('click', (e) => {
        e.preventDefault();
        isSignUp = !isSignUp;

        if (isSignUp) {
            authTitle.textContent = 'Create an account to get started';
            submitBtn.textContent = 'Sign Up';
            toggleText.innerHTML = 'Already have an account? <a href="#" id="toggleAuth">Sign In</a>';
        } else {
            authTitle.textContent = 'Sign in to access the Job Intake Form';
            submitBtn.textContent = 'Sign In';
            toggleText.innerHTML = 'Don\'t have an account? <a href="#" id="toggleAuth">Sign Up</a>';
        }

        // Re-attach event listener to new link
        document.getElementById('toggleAuth').addEventListener('click', (e) => {
            // Trigger the toggle again (recursive but simple for this case)
            toggleAuth.click();
        });

        authMessage.classList.add('hidden');
    });

    // Handle Form Submit
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
            showMessage('error', error.message);
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
