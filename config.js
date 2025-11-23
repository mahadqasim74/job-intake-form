// Supabase Configuration
// REPLACE with your actual values from the Supabase Dashboard
const SUPABASE_URL = 'https://wlafyyarzwqkypdotaop.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_MNIcgvRmVqkcRsbFhWn2-Q_h4w31brL';

// Initialize Supabase client
// Note: We'll load the supabase-js library from CDN in the HTML files
let supabase;

function initSupabase() {
    if (window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase initialized');
    } else {
        console.error('❌ Supabase library not loaded');
    }
}
