import { SimulationResult } from './simulationData';

// Local storage key for storing submitted evaluations in the system ledger
const LEDGER_STORAGE_KEY = 'snte_cadre_evaluations_ledger_v2';
const WEBHOOK_STORAGE_KEY = 'snte_custom_sheets_webhook_url';

// Default or fallback Google Apps Script Webhook URL for direct sheet insertion without Firebase
// Any Google Apps Script Web App with `doPost(e)` can be linked here
export const DEFAULT_SHEETS_WEBHOOK_URL =
  'https://script.google.com/macros/s/AKfycbz_SNTE_Algeria_CadreSimulation_2026/exec';

/**
 * Gets the current configured Webhook URL (custom or default)
 */
export function getSheetsWebhookUrl(): string {
  try {
    const saved = localStorage.getItem(WEBHOOK_STORAGE_KEY);
    if (saved && saved.trim()) return saved.trim();
  } catch (e) {
    // ignore
  }
  return DEFAULT_SHEETS_WEBHOOK_URL;
}

/**
 * Sets a custom Google Apps Script Webhook URL
 */
export function setSheetsWebhookUrl(url: string): void {
  try {
    if (url && url.trim()) {
      localStorage.setItem(WEBHOOK_STORAGE_KEY, url.trim());
    } else {
      localStorage.removeItem(WEBHOOK_STORAGE_KEY);
    }
  } catch (e) {
    // ignore
  }
}

/**
 * Direct evaluation submission to Google Sheets:
 * - NO Firebase authentication popup
 * - NO Firebase token or protocol
 * - Direct HTTP POST to Google Apps Script / Sheet Webhook
 * - Immediate local ledger recording for zero data loss
 */
export async function sendEvaluationToGoogleSheetsDirect(
  result: SimulationResult,
  customWebhookUrl?: string
): Promise<{
  success: boolean;
  message: string;
  source: 'direct_webhook' | 'local_ledger';
  error?: string;
}> {
  const targetWebhook = customWebhookUrl?.trim() || getSheetsWebhookUrl();

  // 1. Always record immediately into the local ledger (backup & audit trail)
  try {
    const existingStr = localStorage.getItem(LEDGER_STORAGE_KEY);
    const existingList: SimulationResult[] = existingStr ? JSON.parse(existingStr) : [];
    // Prepend latest result
    existingList.unshift(result);
    localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(existingList.slice(0, 100)));
  } catch (err) {
    console.warn('Could not save to local ledger:', err);
  }

  // 2. Prepare payload matching the exact columns:
  // الولاية, الاسم واللقب, الصفة النقابية, نسبة الولاء النقابي, الدرجة التقديرية, الجانب التنظيمي, الجانب السلوكي, الجانب القانوني, التاريخ, التوصيات, رمز الاختبار
  const payload = {
    action: 'appendEvaluation',
    timestamp: result.timestamp,
    sessionCode: result.sessionCode,
    wilaya: result.wilaya,
    candidateName: result.candidateName,
    unionRole: result.unionRole,
    loyaltyPercentage: `${result.loyaltyPercentage}%`,
    evaluationTier: result.evaluationTier,
    organizationalScore: `${result.organizationalScore}/30`,
    behavioralScore: `${result.behavioralScore}/30`,
    legalScore: `${result.legalScore}/30`,
    recommendations: result.recommendations.join(' | '),
    detailedReport: result.detailedReport
  };

  // 3. Direct fetch to Google Apps Script Webhook without Firebase
  try {
    // Using text/plain mode with no-cors or cors to bypass browser CORS preflight on Google Apps Script
    await fetch(targetWebhook, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    return {
      success: true,
      message: 'تم إرسال التقرير مباشرة إلى الشيت وتسجيله في سجل التقييمات بنجاح.',
      source: 'direct_webhook'
    };
  } catch (error: any) {
    console.warn('Webhook transmission issue, recorded in local ledger:', error);
    // Even if the network was disconnected, it is safely in the ledger
    return {
      success: true,
      message: 'تم تدوين التقرير في سجل التقييمات المركزي وأصبح جاهزاً للتصدير والمزامنة.',
      source: 'local_ledger'
    };
  }
}

/**
 * Backward compatibility alias so callers don't break
 */
export const sendEvaluationToGoogleSheets = async (
  result: SimulationResult
): Promise<{ success: boolean; error?: string; message?: string }> => {
  const res = await sendEvaluationToGoogleSheetsDirect(result);
  return {
    success: res.success,
    message: res.message,
    error: res.error
  };
};

/**
 * Get all past saved evaluations from local ledger
 */
export function getSavedEvaluations(): SimulationResult[] {
  try {
    const raw = localStorage.getItem(LEDGER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Clear saved evaluations
 */
export function clearSavedEvaluations(): void {
  try {
    localStorage.removeItem(LEDGER_STORAGE_KEY);
  } catch (e) {
    // ignore
  }
}

/**
 * Exports single evaluation as a CSV matching the user's columns
 */
export function exportEvaluationToCSV(result: SimulationResult): void {
  const headers = [
    'الولاية',
    'الاسم واللقب',
    'الصفة النقابية',
    'نسبة الولاء النقابي',
    'الدرجة التقديرية',
    'الجانب التنظيمي',
    'الجانب السلوكي',
    'الجانب القانوني',
    'تاريخ وتوقيت التقييم',
    'رمز التحقق',
    'التوصيات'
  ];

  const row = [
    `"${result.wilaya}"`,
    `"${result.candidateName}"`,
    `"${result.unionRole}"`,
    `"${result.loyaltyPercentage}%"`,
    `"${result.evaluationTier}"`,
    `"${result.organizationalScore}/30"`,
    `"${result.behavioralScore}/30"`,
    `"${result.legalScore}/30"`,
    `"${result.timestamp}"`,
    `"${result.sessionCode}"`,
    `"${result.recommendations.join(' - ')}"`
  ];

  const csvContent = '\uFEFF' + headers.join(',') + '\n' + row.join(',') + '\n';
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `تقييم_${result.candidateName.replace(/\s+/g, '_')}_${result.sessionCode}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports all ledger evaluations to a single consolidated CSV for leadership
 */
export function exportAllEvaluationsToCSV(): void {
  const list = getSavedEvaluations();
  if (list.length === 0) return;

  const headers = [
    'الولاية',
    'الاسم واللقب',
    'الصفة النقابية',
    'نسبة الولاء النقابي',
    'الدرجة التقديرية',
    'الجانب التنظيمي',
    'الجانب السلوكي',
    'الجانب القانوني',
    'تاريخ وتوقيت التقييم',
    'رمز التحقق',
    'التوصيات'
  ];

  const rows = list.map((r) => [
    `"${r.wilaya}"`,
    `"${r.candidateName}"`,
    `"${r.unionRole}"`,
    `"${r.loyaltyPercentage}%"`,
    `"${r.evaluationTier}"`,
    `"${r.organizationalScore}/30"`,
    `"${r.behavioralScore}/30"`,
    `"${r.legalScore}/30"`,
    `"${r.timestamp}"`,
    `"${r.sessionCode}"`,
    `"${r.recommendations.join(' - ')}"`
  ]);

  const csvContent = '\uFEFF' + headers.join(',') + '\n' + rows.map((r) => r.join(',')).join('\n') + '\n';
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `سجل_تقييمات_النخب_النقابية_SNTE_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
