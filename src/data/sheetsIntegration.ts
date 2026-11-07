import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { SimulationResult } from './simulationData';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('تعذر استخراج رمز الدخول من حساب Google');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Google Sign In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

/**
 * Creates or appends evaluation result directly to a Google Sheet
 * Spreadsheet columns: الولاية, الاسم واللقب, الصفة النقابية, النسبة المئوية للولاء, التقييم الشامل, التاريخ, التنظيمي, السلوكي, القانوني
 */
export async function sendEvaluationToGoogleSheets(
  result: SimulationResult,
  existingSpreadsheetId?: string
): Promise<{ success: boolean; spreadsheetId?: string; spreadsheetUrl?: string; error?: string }> {
  try {
    let token = cachedAccessToken;
    if (!token) {
      const authResult = await googleSignIn();
      if (!authResult?.accessToken) {
        throw new Error('يرجى تسجيل الدخول بحساب Google أولاً لمزامنة التقرير مع الشيت.');
      }
      token = authResult.accessToken;
    }

    let spreadsheetId = existingSpreadsheetId?.trim();

    // 1. If no spreadsheet ID exists, create a new Google Sheet file
    if (!spreadsheetId) {
      const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            title: 'تقارير محاكاة أهلية النخب النقابية - SNTE 2026'
          },
          sheets: [
            {
              properties: {
                title: 'سجل التقييم والولاء النقابي',
                gridProperties: {
                  rowCount: 200,
                  columnCount: 12
                }
              }
            }
          ]
        })
      });

      if (!createRes.ok) {
        const errData = await createRes.json();
        throw new Error(errData.error?.message || 'تعذر إنشاء جدول بيانات Google Sheets');
      }

      const createdData = await createRes.json();
      spreadsheetId = createdData.spreadsheetId;

      // Add Headers matching user's exact specification + performance metrics
      const headerRow = [
        'الولاية',
        'الاسم واللقب',
        'الصفة النقابية',
        'نسبة الولاء النقابي',
        'الدرجة التقديرية',
        'الجانب التنظيمي',
        'الجانب السلوكي',
        'الجانب القانوني',
        'تاريخ وتوقيت التقييم',
        'التوصيات والملاحظات'
      ];

      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'سجل التقييم والولاء النقابي'!A1:J1:append?valueInputOption=USER_ENTERED`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            values: [headerRow]
          })
        }
      );
    }

    // 2. Append Candidate Record
    const dataRow = [
      result.wilaya,
      result.candidateName,
      result.unionRole,
      `${result.loyaltyPercentage}%`,
      result.evaluationTier,
      `${result.organizationalScore}/30`,
      `${result.behavioralScore}/30`,
      `${result.legalScore}/30`,
      result.timestamp,
      result.recommendations.join(' - ')
    ];

    const appendRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'سجل التقييم والولاء النقابي'!A1:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: [dataRow]
        })
      }
    );

    if (!appendRes.ok) {
      // Fallback: try default sheet range
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:append?valueInputOption=USER_ENTERED`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            values: [dataRow]
          })
        }
      );
    }

    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

    return {
      success: true,
      spreadsheetId,
      spreadsheetUrl
    };
  } catch (error: any) {
    console.error('Error sending evaluation to Google Sheets:', error);
    return {
      success: false,
      error: error.message || 'حدث خطأ غير متوقع أثناء إرسال البيانات إلى الشيت'
    };
  }
}
