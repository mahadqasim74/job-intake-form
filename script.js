// PDF Form Script v2 - Latest version with enhanced debugging
console.log('🚀 PDF Form Script v2 loaded successfully!');

// Get form elements
const form = document.getElementById('jobIntakeForm');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// Form validation
function validateForm() {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('error');
            field.classList.remove('success');
            isValid = false;

            // Remove error class on input
            field.addEventListener('input', function () {
                if (this.value.trim()) {
                    this.classList.remove('error');
                    this.classList.add('success');
                } else {
                    this.classList.add('error');
                    this.classList.remove('success');
                }
            }, { once: true });
        } else {
            field.classList.remove('error');
            field.classList.add('success');
        }
    });

    return isValid;
}

// Show toast notification
function showToast(message, duration = 3000) {
    toastMessage.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// Generate PDF
function generatePDF() {
    // Try multiple ways to access jsPDF
    let jsPDF;

    if (window.jspdf && window.jspdf.jsPDF) {
        jsPDF = window.jspdf.jsPDF;
    } else if (window.jsPDF) {
        jsPDF = window.jsPDF;
    } else {
        console.error('jsPDF library not loaded!');
        throw new Error('PDF library not available. Please refresh the page and try again.');
    }

    const doc = new jsPDF();


    // Get form values
    const formData = {
        jobName: document.getElementById('jobName').value,
        jobNumber: document.getElementById('jobNumber').value,
        location: document.getElementById('location').value,
        jobStartDate: document.getElementById('jobStartDate').value,
        pm: document.getElementById('pm').value,
        superintendent: document.getElementById('superintendent').value,
        sub: document.getElementById('sub').value,
        trade: document.getElementById('trade').value,
        submittal: document.getElementById('submittal').value,
        scopeOfWork: document.getElementById('scopeOfWork').value,
        specialRequirements: document.getElementById('specialRequirements').value,
        contactName: document.getElementById('contactName').value,
        contactPhone: document.getElementById('contactPhone').value,
        contactEmail: document.getElementById('contactEmail').value,
        notes: document.getElementById('notes').value
    };

    // Set font
    doc.setFont('helvetica');

    // Title
    doc.setFontSize(20);
    doc.setTextColor(102, 126, 234);
    doc.text('JOB INTAKE FORM', 105, 20, { align: 'center' });

    // Add a line
    doc.setDrawColor(102, 126, 234);
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);

    let yPosition = 35;
    const lineHeight = 8;
    const leftMargin = 20;
    const rightMargin = 190;
    const maxWidth = rightMargin - leftMargin;

    // Helper function to add a field
    function addField(label, value, isBold = false) {
        if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
        }

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(label, leftMargin, yPosition);

        yPosition += 5;

        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        if (isBold) doc.setFont('helvetica', 'bold');
        else doc.setFont('helvetica', 'normal');

        if (value) {
            const lines = doc.splitTextToSize(value, maxWidth);
            doc.text(lines, leftMargin, yPosition);
            yPosition += (lines.length * 5) + 3;
        } else {
            doc.setTextColor(150, 150, 150);
            doc.text('Not provided', leftMargin, yPosition);
            yPosition += 8;
        }
    }

    // Add all fields to PDF
    addField('Job Name:', formData.jobName, true);
    addField('Job Number:', formData.jobNumber, true);
    addField('Location:', formData.location);
    addField('Job Start Date:', formData.jobStartDate ? new Date(formData.jobStartDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : '');

    // Add spacing before personnel section
    yPosition += 3;
    doc.setFontSize(12);
    doc.setTextColor(102, 126, 234);
    doc.text('PERSONNEL', leftMargin, yPosition);
    yPosition += 8;

    addField('Project Manager (PM):', formData.pm);
    addField('Superintendent:', formData.superintendent);

    // Add spacing before project details
    yPosition += 3;
    doc.setFontSize(12);
    doc.setTextColor(102, 126, 234);
    doc.text('PROJECT DETAILS', leftMargin, yPosition);
    yPosition += 8;

    addField('Sub-contractor:', formData.sub);
    addField('Trade:', formData.trade);
    addField('Submittal:', formData.submittal);
    addField('Scope of Work:', formData.scopeOfWork);
    addField('Special Requirements:', formData.specialRequirements);

    // Add spacing before contact section
    yPosition += 3;
    doc.setFontSize(12);
    doc.setTextColor(102, 126, 234);
    doc.text('CONTACT INFORMATION', leftMargin, yPosition);
    yPosition += 8;

    addField('Contact Name:', formData.contactName);
    addField('Contact Phone:', formData.contactPhone);
    addField('Contact Email:', formData.contactEmail);

    // Add notes section
    if (formData.notes) {
        yPosition += 3;
        doc.setFontSize(12);
        doc.setTextColor(102, 126, 234);
        doc.text('ADDITIONAL NOTES', leftMargin, yPosition);
        yPosition += 8;
        addField('Notes:', formData.notes);
    }

    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
            `Page ${i} of ${pageCount} | Generated on ${new Date().toLocaleDateString('en-US')}`,
            105,
            290,
            { align: 'center' }
        );
    }

    // Save the PDF
    const fileName = `Job_Intake_${formData.jobNumber || 'Form'}_${new Date().getTime()}.pdf`;
    console.log('💾 Saving PDF as:', fileName);
    doc.save(fileName);
    console.log('✅ PDF save() method called');

    return fileName;
}

// Form submit handler
form.addEventListener('submit', function (e) {
    e.preventDefault();
    console.log('🔍 Form submitted');

    // Validate form
    if (!validateForm()) {
        console.log('❌ Validation failed');
        showToast('Please fill in all required fields', 4000);
        return;
    }

    console.log('✅ Validation passed');

    // Add loading state
    downloadBtn.classList.add('loading');
    downloadBtn.disabled = true;

    // Simulate a small delay for better UX
    setTimeout(() => {
        try {
            console.log('📄 Starting PDF generation...');
            const fileName = generatePDF();
            console.log('✅ PDF generated successfully:', fileName);
            showToast(`PDF "${fileName}" downloaded successfully!`, 4000);
        } catch (error) {
            console.error('❌ Error generating PDF:', error);
            showToast('Error generating PDF. Please try again.', 4000);
        } finally {
            // Remove loading state
            downloadBtn.classList.remove('loading');
            downloadBtn.disabled = false;
            console.log('🔄 Button state reset');
        }
    }, 500);
});

// Reset button handler
resetBtn.addEventListener('click', function () {
    // Confirm reset
    if (confirm('Are you sure you want to reset the form? All entered data will be lost.')) {
        form.reset();

        // Remove validation classes
        const allInputs = form.querySelectorAll('input, textarea');
        allInputs.forEach(input => {
            input.classList.remove('error', 'success');
        });

        showToast('Form reset successfully', 2000);
    }
});

// Add real-time validation for all inputs
const allInputs = form.querySelectorAll('input, textarea');
allInputs.forEach(input => {
    input.addEventListener('blur', function () {
        if (this.hasAttribute('required')) {
            if (!this.value.trim()) {
                this.classList.add('error');
                this.classList.remove('success');
            } else {
                this.classList.remove('error');
                this.classList.add('success');
            }
        }
    });

    // Remove error on input
    input.addEventListener('input', function () {
        if (this.classList.contains('error') && this.value.trim()) {
            this.classList.remove('error');
        }
    });
});

// Add smooth scroll behavior
document.documentElement.style.scrollBehavior = 'smooth';

// Add keyboard shortcuts
document.addEventListener('keydown', function (e) {
    // Ctrl/Cmd + Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        form.dispatchEvent(new Event('submit'));
    }

    // Escape to close toast
    if (e.key === 'Escape' && toast.classList.contains('show')) {
        toast.classList.remove('show');
    }
});

// Add animations on page load
window.addEventListener('load', function () {
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach((group, index) => {
        setTimeout(() => {
            group.style.opacity = '0';
            group.style.animation = `fadeInUp 0.4s ease-out forwards`;
            group.style.animationDelay = `${index * 0.03}s`;
        }, 100);
    });
});

console.log('✅ Job Intake Form initialized successfully!');
console.log('💡 Tip: Press Ctrl/Cmd + Enter to quickly submit the form');
