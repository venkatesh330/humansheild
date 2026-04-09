import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { saveScore, getScoreHistory } from './scoreStorage';

export interface AssessmentSnapshot {
  id: string;
  date: string;
  jobRiskScore: number | null;
  jobTitle: string | null;
  skillRiskScore: number | null;
  humanScore: number | null;
  recommendedActions: string[];
  timeline: string;
  expiresIn: string;
}

export const generateAssessmentSnapshot = (
  jobRiskScore: number | null,
  jobTitle: string | null,
  skillRiskScore: number | null,
  humanScore: number | null,
): AssessmentSnapshot => {
  const recommendations: string[] = [];
  const maxRisk = Math.max(jobRiskScore ?? 0, skillRiskScore ?? 0, humanScore ?? 0);
  
  if (maxRisk >= 85) recommendations.push('Start upskilling immediately (2-4 weeks)');
  if (maxRisk >= 70) recommendations.push('Plan career transition (1-3 months)');
  if (maxRisk >= 55) recommendations.push('Begin targeted skill development');
  
  if (skillRiskScore !== null && skillRiskScore > (jobRiskScore ?? 0)) {
    recommendations.push('Focus on high-risk skills identified');
  }
  
  const timeline = 
    maxRisk >= 85 ? '6-18 months' :
    maxRisk >= 70 ? '18-30 months' :
    maxRisk >= 55 ? '2-4 years' :
    maxRisk >= 40 ? '4-6 years' : '6+ years';

  return {
    id: `snapshot-${Date.now()}`,
    date: new Date().toISOString(),
    jobRiskScore,
    jobTitle,
    skillRiskScore,
    humanScore,
    recommendedActions: recommendations,
    timeline,
    expiresIn: '7 days',
  };
};

export const exportAsJSON = (snapshot: AssessmentSnapshot): string => {
  return JSON.stringify(snapshot, null, 2);
};

/**
 * Generates and downloads a professional PDF report
 * @param snapshot Assessment data
 * @param elementRef Optional ref to the results card for html2canvas snapshot
 */
export const downloadAssessmentPDF = async (snapshot: AssessmentSnapshot, elementId?: string) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // --- Header ---
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('HUMANPROOF', 20, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('AI RESILIENCE & DISPLACEMENT REPORT', 20, 32);
  doc.text(new Date(snapshot.date).toLocaleDateString(), 160, 25);

  let y = 55;

  // --- Executive Summary ---
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', 20, y);
  y += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const summary = `This report analyzes the AI displacement risk for the position of "${snapshot.jobTitle || 'Unspecified'}". Based on the HumanProof 6-dimension model, we have calculated the following resilience metrics.`;
  const splitSummary = doc.splitTextToSize(summary, 170);
  doc.text(splitSummary, 20, y);
  y += splitSummary.length * 7;

  // --- Core Scores ---
  doc.setDrawColor(226, 232, 240);
  doc.line(20, y, 190, y);
  y += 15;

  const drawScore = (label: string, score: number | null, color: [number, number, number]) => {
    if (score === null) return;
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.text(label.toUpperCase(), 25, y);
    
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(25, y + 2, 160, 8, 2, 2, 'F');
    
    doc.setFillColor(...color);
    doc.roundedRect(25, y + 2, (score / 100) * 160, 8, 2, 2, 'F');
    
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${score}%`, 172, y + 1);
    
    y += 20;
  };

  drawScore('Automation Risk Profile', snapshot.jobRiskScore, [239, 68, 68]); // Red
  drawScore('Skill Displacement Risk', snapshot.skillRiskScore, [245, 158, 11]); // Amber
  drawScore('Human Irreplaceability Index', snapshot.humanScore, [16, 185, 129]); // Emerald

  // --- Timeline ---
  y += 5;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, y, 170, 25, 3, 3, 'F');
  
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Recommended Action Timeline:', 30, y + 10);
  
  doc.setTextColor(34, 197, 94);
  doc.setFontSize(14);
  doc.text(snapshot.timeline, 30, y + 18);
  y += 35;

  // --- Actions ---
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Strategic Recommendations', 20, y);
  y += 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  snapshot.recommendedActions.forEach(action => {
    doc.text(`• ${action}`, 25, y);
    y += 7;
  });

  // --- Visual Snapshot (High-Fidelity) ---
  if (elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      y += 10;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Visual Assessment Breakdown', 20, y);
      y += 5;
      
      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#0f172a'
        });
        const imgData = canvas.toDataURL('image/png');
        const imgProps = doc.getImageProperties(imgData);
        const pdfWidth = 170;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        // Handle page break if needed
        if (y + pdfHeight > 280) {
          doc.addPage();
          y = 20;
        }
        
        doc.addImage(imgData, 'PNG', 20, y, pdfWidth, pdfHeight);
      } catch (err) {
        console.error('Failed to capture snapshot:', err);
      }
    }
  }

  // --- Footer ---
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.text(`HumanProof © 2026 | Proprietary Displacement Analysis | Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
  }

  doc.save(`HumanProof_Report_${snapshot.jobTitle || 'Professional'}.pdf`);
};

export const generateShareableLink = (): string => {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `/share/${code}`;
};

export const generateHistoryComparison = (): { current: number | null; previous: number | null; delta: number | null; trend: string } => {
  const history = getScoreHistory();
  if (history.length < 2) return { current: null, previous: null, delta: null, trend: 'insufficient_data' };
  
  const current = history[history.length - 1];
  const previous = history[history.length - 2];
  
  const delta = current.score - previous.score;
  const trend = delta > 2 ? 'deteriorating' : delta < -2 ? 'improving' : 'stable';
  
  return {
    current: current.score,
    previous: previous.score,
    delta,
    trend,
  };
};
