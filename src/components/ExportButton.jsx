import { useState } from 'react';
import jsPDF from 'jspdf';

function ExportButton({ extractedText, headings }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    if (!extractedText) {
      alert('No text to export. Please upload and process a file first.');
      return;
    }

    setIsExporting(true);

    try {
      const pdf = new jsPDF();
      
      // Set up document properties
      pdf.setProperties({
        title: 'Pen2PDF Export',
        creator: 'Pen2PDF App'
      });

      // Parse text with headings
      let yPosition = 20;
      const lineHeight = 7;
      const pageHeight = pdf.internal.pageSize.height;
      const maxLineWidth = 180;

      // Split text into paragraphs
      const paragraphs = extractedText.split('\n\n');

      for (let paragraph of paragraphs) {
        if (!paragraph.trim()) continue;

        // Check if this paragraph is marked as a heading
        const headingLevel = headings && headings[paragraph.trim()];
        
        if (headingLevel) {
          // Handle headings
          if (headingLevel === 'h1') {
            pdf.setFontSize(18);
            pdf.setFont(undefined, 'bold');
          } else if (headingLevel === 'h2') {
            pdf.setFontSize(14);
            pdf.setFont(undefined, 'bold');
          } else if (headingLevel === 'h3') {
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'bold');
          }
          
          // Add some extra space before headings
          yPosition += 5;
        } else {
          // Regular text
          pdf.setFontSize(11);
          pdf.setFont(undefined, 'normal');
        }

        // Split long paragraphs into lines
        const lines = pdf.splitTextToSize(paragraph, maxLineWidth);
        
        for (let line of lines) {
          // Check if we need a new page
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }
          
          pdf.text(line, 15, yPosition);
          yPosition += lineHeight;
        }

        // Add extra space after paragraphs
        yPosition += 3;
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
      const filename = `Pen2PDF-Export-${timestamp}.pdf`;

      // Save the PDF
      pdf.save(filename);

    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error exporting PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="export-button">
      <button
        onClick={handleExportPDF}
        disabled={!extractedText || isExporting}
        className={`export-btn ${
          extractedText && !isExporting ? 'export-btn-active' : 'export-btn-disabled'
        }`}
      >
        {isExporting ? (
          <>
            <svg className="export-icon processing-spinner" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <svg className="export-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download PDF</span>
          </>
        )}
      </button>
    </div>
  );
}

export default ExportButton;