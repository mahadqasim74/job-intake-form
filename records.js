// Initialize Supabase when page loads
document.addEventListener('DOMContentLoaded', async () => {
    initSupabase();
    await fetchRecords();
});

const searchInput = document.getElementById('searchInput');
const recordsBody = document.getElementById('recordsBody');
const noResults = document.getElementById('noResults');

// Debounce search input
let searchTimeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        fetchRecords(e.target.value);
    }, 300);
});

async function fetchRecords(query = '') {
    if (!supabase) {
        recordsBody.innerHTML = `<tr><td colspan="6" class="text-center error-text">Database not connected. Please check config.js</td></tr>`;
        return;
    }

    recordsBody.innerHTML = `<tr><td colspan="6" class="text-center">Loading...</td></tr>`;

    try {
        let queryBuilder = supabase
            .from('jobs')
            .select('*')
            .order('created_at', { ascending: false });

        if (query) {
            queryBuilder = queryBuilder.or(`job_name.ilike.%${query}%,job_number.ilike.%${query}%,location.ilike.%${query}%`);
        }

        const { data, error } = await queryBuilder;

        if (error) throw error;

        renderRecords(data);
    } catch (error) {
        console.error('Error fetching records:', error);
        recordsBody.innerHTML = `<tr><td colspan="6" class="text-center error-text">Error loading records: ${error.message}</td></tr>`;
    }
}

function renderRecords(records) {
    recordsBody.innerHTML = '';

    if (!records || records.length === 0) {
        recordsBody.innerHTML = '';
        noResults.classList.remove('hidden');
        return;
    }

    noResults.classList.add('hidden');

    records.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="font-medium">${escapeHtml(record.job_number)}</td>
            <td>${escapeHtml(record.job_name)}</td>
            <td>${escapeHtml(record.location)}</td>
            <td>${formatDate(record.job_start_date)}</td>
            <td>${escapeHtml(record.pm)}</td>
            <td>
                <button onclick="viewDetails('${record.id}')" class="btn-icon" title="View Details">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                </button>
            </td>
        `;
        recordsBody.appendChild(row);
    });
}

function escapeHtml(unsafe) {
    if (!unsafe) return '-';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
}

function viewDetails(id) {
    // For now, just alert. In a real app, this could open a modal or detail page
    alert('View details for ID: ' + id);
}
