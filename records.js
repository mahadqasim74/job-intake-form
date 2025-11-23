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
                <div class="action-buttons">
                    <button onclick="viewDetails('${record.id}')" class="btn-icon" title="View Details">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                    <button onclick="deleteRecord('${record.id}')" class="btn-icon delete-icon" title="Delete Record">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
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
    window.location.href = `details.html?id=${id}`;
}

async function deleteRecord(id) {
    if (confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
        try {
            const { error } = await supabase
                .from('jobs')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Refresh the list
            fetchRecords(searchInput.value);

        } catch (error) {
            console.error('Error deleting record:', error);
            alert('Error deleting record: ' + error.message);
        }
    }
}
