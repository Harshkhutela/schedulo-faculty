document.getElementById('generateBtn').addEventListener('click', async () => {
    const response = await fetch('/api/timetable/generate', { method: 'POST' });
    const timetable = await response.json();
    
    // Populate timetable data into the HTML
    console.log(timetable);
    // Add code to dynamically generate and display the timetable on the page
  });
  
  document.getElementById('exportExcelBtn').addEventListener('click', async () => {
    window.location.href = '/api/timetable/export/excel';
  });
  
  document.getElementById('exportPdfBtn').addEventListener('click', async () => {
    window.location.href = '/api/timetable/export/pdf';
  });
  



  document.addEventListener('DOMContentLoaded', function () {
    const generateBtn = document.querySelector('form[action="/step6/generate"] button');
    const timetableSection = document.querySelector('table');
  
    if (generateBtn) {
      generateBtn.addEventListener('click', () => {
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';
      });
    }
  
    // Smooth scroll to timetable on generation
    if (timetableSection) {
      timetableSection.scrollIntoView({ behavior: 'smooth' });
    }
  
    // Add confirmation for export buttons
    const exportExcel = document.querySelector('a[href="/step6/export/excel"]');
    const exportPDF = document.querySelector('a[href="/step6/export/pdf"]');
  
    if (exportExcel) {
      exportExcel.addEventListener('click', (e) => {
        if (!confirm('Are you sure you want to export the timetable to Excel?')) {
          e.preventDefault();
        }
      });
    }
  
    if (exportPDF) {
      exportPDF.addEventListener('click', (e) => {
        if (!confirm('Are you sure you want to export the timetable to PDF?')) {
          e.preventDefault();
        }
      });
    }
  });
  