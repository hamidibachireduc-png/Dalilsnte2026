import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Captures an HTML element by ID and downloads it as an A4 Landscape PDF.
 */
export async function downloadCertificateAsPDF(
  elementId: string,
  candidateName: string,
  sessionCode: string
): Promise<boolean> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element #${elementId} not found`);
      return false;
    }

    // Capture at high resolution (scale 2 or 3)
    const canvas = await html2canvas(element, {
      scale: 2.5,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png', 1.0);

    // Standard A4 landscape dimensions: 297mm x 210mm
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = 297;
    const pdfHeight = 210;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

    const cleanName = candidateName.trim().replace(/\s+/g, '_') || 'نقابي';
    pdf.save(`شهادة_أهلية_نقابية_${cleanName}_${sessionCode}.pdf`);
    return true;
  } catch (error) {
    console.error('Failed to generate PDF certificate:', error);
    return false;
  }
}
