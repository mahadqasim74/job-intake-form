// Initialize Supabase
initSupabase();

document.addEventListener('DOMContentLoaded', async () => {
    // Get ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const recordId = urlParams.get('id');

    if (!recordId) {
        alert('No record ID provided');
        window.location.href = 'records.html';
        return;
    }

    await fetchRecordDetails(recordId);
});

let currentRecord = null;

async function fetchRecordDetails(id) {
    const loadingState = document.getElementById('loadingState');
    const detailsContent = document.getElementById('detailsContent');

    try {
        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        currentRecord = data;
        renderDetails(data);

        loadingState.classList.add('hidden');
        detailsContent.classList.remove('hidden');

    } catch (error) {
        console.error('Error fetching details:', error);
        loadingState.innerHTML = `<p class="error-text">Error loading record: ${error.message}</p>`;
    }
}

function renderDetails(data) {
    // Header
    setText('headerJobName', data.job_name || 'Untitled Job');
    setText('headerJobNumber', `Job #${data.job_number || 'N/A'}`);

    // Project Details
    setText('d_jobName', data.job_name);
    setText('d_jobNumber', data.job_number);
    setText('d_location', data.location);
    setText('d_startDate', formatDate(data.job_start_date));

    // Personnel
    setText('d_pm', data.pm);
    setText('d_superintendent', data.superintendent);
    setText('d_sub', data.sub);
    setText('d_trade', data.trade);

    // Scope
    setText('d_submittal', data.submittal);
    setText('d_scope', data.scope_of_work);
    setText('d_special', data.special_requirements);

    // Contact
    setText('d_contactName', data.contact_name);
    setText('d_contactPhone', data.contact_phone);
    setText('d_contactEmail', data.contact_email);

    // Notes
    setText('d_notes', data.notes);
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value || '-';
    }
}

function formatDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
}

// PDF Generation (Reused logic)
document.getElementById('downloadBtn').addEventListener('click', () => {
    if (!currentRecord) return;

    try {
        generatePDFFromRecord(currentRecord);
        showToast('PDF downloaded successfully!', 3000);
    } catch (error) {
        console.error('Error generating PDF:', error);
        showToast('Error generating PDF', 3000);
    }
});

// Edit Record
document.getElementById('editBtn').addEventListener('click', () => {
    if (!currentRecord) return;
    window.location.href = `index.html?id=${currentRecord.id}`;
});

// Delete Record
document.getElementById('deleteBtn').addEventListener('click', async () => {
    if (!currentRecord) return;

    if (confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
        try {
            const { error } = await supabase
                .from('jobs')
                .delete()
                .eq('id', currentRecord.id);

            if (error) throw error;

            alert('Record deleted successfully');
            window.location.href = 'records.html';

        } catch (error) {
            console.error('Error deleting record:', error);
            showToast('Error deleting record: ' + error.message, 4000);
        }
    }
});

function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

function generatePDFFromRecord(data) {
    // Initialize jsPDF
    let jsPDF;
    if (window.jspdf && window.jspdf.jsPDF) {
        jsPDF = window.jspdf.jsPDF;
    } else if (window.jsPDF) {
        jsPDF = window.jsPDF;
    } else {
        throw new Error('PDF library not loaded');
    }

    const doc = new jsPDF();

    // Colors
    const primaryColor = [36, 32, 77]; // Dark blue
    const accentColor = [79, 172, 254]; // Light blue
    const textColor = [60, 60, 60];

    // Helper function for text
    const addText = (text, x, y, size = 12, color = textColor, font = 'helvetica', style = 'normal') => {
        doc.setFontSize(size);
        doc.setTextColor(...color);
        doc.setFont(font, style);
        doc.text(text || '-', x, y);
    };

    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');

    addText('JOB INTAKE FORM', 105, 20, 24, [255, 255, 255], 'helvetica', 'bold');
    doc.text('JOB INTAKE FORM', 105, 20, { align: 'center' });

    addText(`Date: ${new Date().toLocaleDateString()}`, 190, 30, 10, [200, 200, 200], 'helvetica', 'normal');
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 190, 30, { align: 'right' });

    let yPos = 55;
    const leftCol = 20;
    const rightCol = 110;
    const lineHeight = 10;

    // Section Header Helper
    const addSection = (title) => {
        doc.setFillColor(240, 240, 245);
        doc.roundedRect(15, yPos - 5, 180, 10, 2, 2, 'F');
        addText(title, 20, yPos + 1, 12, primaryColor, 'helvetica', 'bold');
        yPos += 15;
    };

    // Field Helper
    const addField = (label, value, x) => {
        addText(label, x, yPos, 10, [100, 100, 100], 'helvetica', 'bold');
        addText(String(value || '-'), x, yPos + 6, 11, textColor, 'helvetica', 'normal');
    };

    // 1. Project Details
    addSection('PROJECT DETAILS');

    addField('Job Name', data.job_name, leftCol);
    addField('Job Number', data.job_number, rightCol);
    yPos += 15;

    addField('Location', data.location, leftCol);
    addField('Start Date', formatDate(data.job_start_date), rightCol);
    yPos += 20;

    // 2. Personnel
    addSection('PERSONNEL');

    addField('Project Manager', data.pm, leftCol);
    addField('Superintendent', data.superintendent, rightCol);
    yPos += 15;

    addField('Subcontractor', data.sub, leftCol);
    addField('Trade', data.trade, rightCol);
    yPos += 20;

    // 3. Scope & Requirements
    addSection('SCOPE & REQUIREMENTS');

    addField('Submittal', data.submittal, leftCol);
    yPos += 15;

    addText('Scope of Work', leftCol, yPos, 10, [100, 100, 100], 'helvetica', 'bold');
    const splitScope = doc.splitTextToSize(data.scope_of_work || '-', 170);
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'normal');
    doc.text(splitScope, leftCol, yPos + 6);
    yPos += splitScope.length * 5 + 10;

    addText('Special Requirements', leftCol, yPos, 10, [100, 100, 100], 'helvetica', 'bold');
    const splitSpecial = doc.splitTextToSize(data.special_requirements || '-', 170);
    doc.text(splitSpecial, leftCol, yPos + 6);
    yPos += splitSpecial.length * 5 + 15;

    // Check for page break
    if (yPos > 250) {
        doc.addPage();
        yPos = 20;
    }

    // 4. Contact Info
    addSection('CONTACT INFORMATION');

    addField('Contact Name', data.contact_name, leftCol);
    addField('Phone', data.contact_phone, rightCol);
    yPos += 15;

    addField('Email', data.contact_email, leftCol);
    yPos += 20;

    // 5. Notes
    if (data.notes) {
        addSection('ADDITIONAL NOTES');
        const splitNotes = doc.splitTextToSize(data.notes, 170);
        doc.setTextColor(...textColor);
        doc.setFont('helvetica', 'normal');
        doc.text(splitNotes, leftCol, yPos + 5);
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
    }

    // Save
    const fileName = `Job_Intake_${data.job_number || 'Record'}.pdf`;
    doc.save(fileName);
}
