import React, { useState } from 'react';
import {
  Award,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  Send,
  User,
  MapPin,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  FileCheck2,
  ExternalLink,
  Loader2,
  RotateCcw
} from 'lucide-react';
import {
  ALGERIA_WILAYAS,
  UNION_ROLES,
  SIMULATION_QUESTIONS,
  SimulationQuestion,
  SimulationResult
} from '../data/simulationData';
import { sendEvaluationToGoogleSheets } from '../data/sheetsIntegration';

export const UnionCadreSimulation: React.FC<{
  isDarkMode: boolean;
}> = ({ isDarkMode }) => {
  // Step: 'info' -> 'questions' -> 'submitting_to_sheet' -> 'report'
  const [stage, setStage] = useState<'info' | 'questions' | 'submitting_to_sheet' | 'report'>('info');

  // Candidate Profile
  const [candidateName, setCandidateName] = useState<string>('');
  const [wilaya, setWilaya] = useState<string>(ALGERIA_WILAYAS[15]); // default: 16 - الجزائر العاصمة
  const [unionRole, setUnionRole] = useState<string>(UNION_ROLES[0]);
  const [customSheetId, setCustomSheetId] = useState<string>('');

  // Answers State: questionId -> selectedOptionIndex
  const [answers, setAnswers] = useState<{ [qId: number]: number }>({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);

  // Result & Sheets State
  const [evaluationResult, setEvaluationResult] = useState<SimulationResult | null>(null);
  const [sheetSyncStatus, setSheetSyncStatus] = useState<{
    success: boolean;
    spreadsheetUrl?: string;
    error?: string;
  } | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const currentQ: SimulationQuestion = SIMULATION_QUESTIONS[currentQuestionIdx];

  const handleStartSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim()) return;
    setStage('questions');
    setCurrentQuestionIdx(0);
  };

  const handleSelectOption = (optIdx: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optIdx
    }));
  };

  const calculateFullReport = (): SimulationResult => {
    let orgScore = 0;
    let behScore = 0;
    let legScore = 0;

    SIMULATION_QUESTIONS.forEach((q) => {
      const selectedIdx = answers[q.id];
      if (selectedIdx !== undefined) {
        const option = q.options[selectedIdx];
        if (q.category === 'تنظيمي') orgScore += option.score;
        if (q.category === 'سلوكي ومواقفي') behScore += option.score;
        if (q.category === 'قانوني وتشريعي') legScore += option.score;
      }
    });

    const totalRaw = orgScore + behScore + legScore; // max 90
    const loyaltyPct = Math.round((totalRaw / 90) * 100);

    let tier = '';
    let tierColor = '';
    const recommendations: string[] = [];

    if (loyaltyPct >= 85) {
      tier = 'كادر نقابي قيادي مؤهل بامتياز (ولاء نقابي صلب)';
      tierColor = 'emerald';
      recommendations.push('أهلية عالية للترشح للمسؤوليات التنفيذية بالمكاتب الولائية والوطنية');
      recommendations.push('القدرة على قيادة الأزمات بالحوار المؤسساتي والانضباط المالي والتنظيمي');
      recommendations.push('تأهيل المترشح للمشاركة في تأطير الملتقيات والجامعات الصيفية للنقابة');
    } else if (loyaltyPct >= 70) {
      tier = 'مناضل نقابي كفء وجدير بالثقة (ولاء نقابي جيد)';
      tierColor = 'blue';
      recommendations.push('تعزيز الاطلاع على تفاصيل النظام الداخلي وبنود القانون 23/02');
      recommendations.push('إشراكه في لجان العمل المتخصصة لتنمية المهارات التفاوضية والقانونية');
      recommendations.push('مناسب للمهام التنسيقية والتنظيمية بالبلديات والمؤسسات');
    } else if (loyaltyPct >= 50) {
      tier = 'منخرط في مرحلة التدرج النقابي (ولاء نقابي متوسط)';
      tierColor = 'amber';
      recommendations.push('يحتاج إلى دورات تكوينية مكثفة في ميثاق أخلاقيات العمل النقابي');
      recommendations.push('ضرورة الالتزام بالتدرج الهيكلي وضبط التصرفات أثناء الأزمات والنزاعات');
      recommendations.push('التركيز على فهم اختصاصات الهيئات لتجنب تضارب الصلاحيات');
    } else {
      tier = 'مستوى غير مؤهل حالياً للمسؤولية القيادية (يحتاج تقويم)';
      tierColor = 'red';
      recommendations.push('تسجيل خروقات للمفاهيم الأساسية للحياد واستقلالية النقابة');
      recommendations.push('إلزامه بحضور أيام دراسية حول الحقوق والواجبات قبل منحه أي تفويض');
      recommendations.push('إعادة التقييم بعد عهدة تكوينية في هياكل الفرع النقابي');
    }

    const reportText = `تقرير تقييم محاكاة أهلية النخب النقابية:
- الاسم واللقب: ${candidateName}
- الولاية: ${wilaya}
- الصفة النقابية: ${unionRole}
- نسبة الولاء والجاهزية: ${loyaltyPct}% (${tier})
- الجانب التنظيمي: ${orgScore}/30
- الجانب السلوكي: ${behScore}/30
- الجانب القانوني: ${legScore}/30
- تاريخ التقييم: ${new Date().toLocaleString('ar-DZ')}`;

    return {
      candidateName,
      wilaya,
      unionRole,
      overallScore: totalRaw,
      loyaltyPercentage: loyaltyPct,
      organizationalScore: orgScore,
      behavioralScore: behScore,
      legalScore: legScore,
      evaluationTier: tier,
      tierColor,
      recommendations,
      detailedReport: reportText,
      timestamp: new Date().toLocaleString('ar-DZ')
    };
  };

  const handleFinishAndSendToSheet = async () => {
    const result = calculateFullReport();
    setEvaluationResult(result);
    setStage('submitting_to_sheet');
    setIsSyncing(true);

    // CRITICAL: Send directly to Google Sheets before revealing report to the candidate
    try {
      const syncRes = await sendEvaluationToGoogleSheets(result, customSheetId);
      setSheetSyncStatus(syncRes);
    } catch (err: any) {
      setSheetSyncStatus({
        success: false,
        error: err.message || 'حدث خطأ في المزامنة'
      });
    } finally {
      setIsSyncing(false);
      // Proceed to show the report
      setStage('report');
    }
  };

  const handleReset = () => {
    setStage('info');
    setAnswers({});
    setCurrentQuestionIdx(0);
    setEvaluationResult(null);
    setSheetSyncStatus(null);
  };

  return (
    <div
      className={`border-2 rounded-3xl p-5 sm:p-8 shadow-2xl transition-colors ${
        isDarkMode
          ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-emerald-500/40 text-stone-100'
          : 'bg-white border-emerald-700/30 text-stone-900 shadow-xl'
      }`}
    >
      {/* Simulation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 mb-6 border-emerald-500/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-6 rounded-full bg-red-600 inline-block" />
            <h2
              className={`text-xl sm:text-2xl font-black font-display ${
                isDarkMode ? 'text-amber-300' : 'text-emerald-950'
              }`}
            >
              محاكاة أهلية النخب والولاء النقابي
            </h2>
          </div>
          <p
            className={`text-xs sm:text-sm mt-1 font-semibold ${
              isDarkMode ? 'text-emerald-400' : 'text-emerald-800'
            }`}
          >
            نظام تقييم حقيقي متعدد المحاور: الجانب التنظيمي · الجانب السلوكي والمواقفي · الجانب القانوني والتشريعي
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
              isDarkMode
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                : 'bg-emerald-50 text-emerald-800 border-emerald-300'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>مزامنة مباشرة مع Google Sheets</span>
          </span>
        </div>
      </div>

      {/* STAGE 1: Candidate Registration */}
      {stage === 'info' && (
        <form onSubmit={handleStartSimulation} className="max-w-2xl mx-auto flex flex-col gap-5 py-4">
          <div
            className={`p-4 rounded-2xl border text-xs sm:text-sm ${
              isDarkMode
                ? 'bg-slate-950/70 border-emerald-500/30 text-stone-300'
                : 'bg-emerald-50/70 border-emerald-200 text-stone-800'
            }`}
          >
            <p className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>تنبيه وإرشادات القيادة النقابية:</span>
            </p>
            <p className="leading-relaxed">
              تضع هذه المحاكاة الإطار النقابي في مواقف وسيناريوهات ميدانية حقيقية لقياس درجة الولاء للنقابة،
              ومدى التقيد بأحكام القانون الأساسي والنظام الداخلي وميثاق الأخلاقيات.
              عند إتمامك لجميع الإجابات، يتم تحرير تقرير تقييمي مفصل وإرساله تلقائياً إلى جدول بيانات Google Sheets
              المركزي قبل استعراضه.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Candidate Name */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-bold flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-500" />
                <span>الاسم واللقب الكامل للمنخرط / المترشح: *</span>
              </label>
              <input
                type="text"
                required
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="مثال: الأستاذ حميدي بشير"
                className={`px-4 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition ${
                  isDarkMode
                    ? 'bg-slate-950 border-slate-700 text-white focus:border-amber-400'
                    : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-emerald-600'
                }`}
              />
            </div>

            {/* Wilaya Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-500" />
                <span>الولاية: *</span>
              </label>
              <select
                value={wilaya}
                onChange={(e) => setWilaya(e.target.value)}
                className={`px-3 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition ${
                  isDarkMode
                    ? 'bg-slate-950 border-slate-700 text-white focus:border-amber-400'
                    : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-emerald-600'
                }`}
              >
                {ALGERIA_WILAYAS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            {/* Union Role Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-emerald-500" />
                <span>الصفة أو المسؤولية النقابية: *</span>
              </label>
              <select
                value={unionRole}
                onChange={(e) => setUnionRole(e.target.value)}
                className={`px-3 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition ${
                  isDarkMode
                    ? 'bg-slate-950 border-slate-700 text-white focus:border-amber-400'
                    : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-emerald-600'
                }`}
              >
                {UNION_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional Existing Google Sheet ID */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-stone-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                <span>معرف شيت مخصص (Spreadsheet ID) - اختياري:</span>
              </span>
              <span className="text-[10px]">إذا ترك فارغاً سيتم إنشاء شيت جديد تلقائياً</span>
            </label>
            <input
              type="text"
              value={customSheetId}
              onChange={(e) => setCustomSheetId(e.target.value)}
              placeholder="مثال: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
              className={`px-4 py-2 rounded-xl border text-xs font-mono focus:outline-none transition ${
                isDarkMode
                  ? 'bg-slate-950 border-slate-800 text-stone-300 focus:border-amber-400'
                  : 'bg-stone-50 border-stone-200 text-stone-800 focus:border-emerald-600'
              }`}
            />
          </div>

          <button
            type="submit"
            className="mt-3 py-3 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-emerald-700 to-emerald-800 hover:from-red-500 hover:to-emerald-700 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition"
          >
            <span>بدء محاكاة الأهلية النقابية (9 أسئلة)</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* STAGE 2: Multi-Criteria Simulation Question Flow */}
      {stage === 'questions' && (
        <div className="flex flex-col gap-5 max-w-3xl mx-auto py-2">
          {/* Progress Header */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-700 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-400 font-mono">
                المحور {currentQuestionIdx + 1} من {SIMULATION_QUESTIONS.length}
              </span>
              <span>·</span>
              <span
                className={`px-2.5 py-0.5 rounded-full font-bold border ${
                  currentQ.category === 'تنظيمي'
                    ? 'bg-blue-950 text-blue-300 border-blue-500/40'
                    : currentQ.category === 'سلوكي ومواقفي'
                    ? 'bg-red-950 text-red-300 border-red-500/40'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                }`}
              >
                الجانب {currentQ.category}
              </span>
            </div>

            <span className="text-stone-400">
              المترشح: <strong className="text-amber-300">{candidateName}</strong> ({wilaya})
            </span>
          </div>

          {/* Question Box */}
          <div
            className={`p-5 rounded-2xl border flex flex-col gap-3 shadow-md ${
              isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-stone-50 border-stone-200'
            }`}
          >
            {currentQ.scenario && (
              <div
                className={`p-3 rounded-xl border text-xs leading-relaxed ${
                  isDarkMode
                    ? 'bg-slate-900 border-amber-500/30 text-amber-100'
                    : 'bg-amber-50 border-amber-300 text-stone-900'
                }`}
              >
                <span className="font-bold text-amber-500 block mb-0.5">📌 الموقف العملي / السيناريو:</span>
                {currentQ.scenario}
              </div>
            )}

            <h3 className="text-base sm:text-lg font-bold leading-relaxed">
              سؤال {currentQuestionIdx + 1}: {currentQ.question}
            </h3>

            {/* Answer Options */}
            <div className="flex flex-col gap-2.5 mt-2">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = answers[currentQ.id] === optIdx;
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`p-3.5 rounded-xl border text-right text-xs sm:text-sm font-medium transition flex items-start gap-3 ${
                      isSelected
                        ? 'bg-emerald-800/30 border-emerald-500 text-emerald-200 ring-2 ring-emerald-400/40'
                        : isDarkMode
                        ? 'bg-slate-900 border-slate-800 text-stone-300 hover:border-slate-700 hover:bg-slate-850'
                        : 'bg-white border-stone-300 text-stone-800 hover:border-emerald-600 hover:bg-stone-50'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                        isSelected
                          ? 'bg-emerald-500 text-white border-emerald-400'
                          : 'border-stone-500 text-stone-400'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="flex-1 leading-relaxed">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Between Questions */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrentQuestionIdx((p) => Math.max(0, p - 1))}
              disabled={currentQuestionIdx === 0}
              className="px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none transition"
            >
              <ChevronRight className="w-4 h-4" />
              <span>السؤال السابق</span>
            </button>

            {currentQuestionIdx < SIMULATION_QUESTIONS.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIdx((p) => p + 1)}
                disabled={answers[currentQ.id] === undefined}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none transition shadow"
              >
                <span>السؤال التالي</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinishAndSendToSheet}
                disabled={answers[currentQ.id] === undefined}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-emerald-700 hover:from-red-500 hover:to-emerald-600 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg disabled:opacity-30 transition"
              >
                <Send className="w-4 h-4" />
                <span>إرسال التقرير للشيت واستعراض النتيجة</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* STAGE 3: Submitting Directly to Google Sheets (Intermediate Loader) */}
      {stage === 'submitting_to_sheet' && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center max-w-md mx-auto">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
          <h3 className="text-lg font-bold font-display text-amber-300">
            جاري تحرير التقرير وإرساله إلى Google Sheets مباشرة...
          </h3>
          <p className="text-xs text-stone-400 leading-relaxed">
            وفق تعليماتك، نقوم الآن بتسجيل بيانات المنخرط ({candidateName} - {wilaya}) ونتائج المحاكاة في جدول البيانات
            قبيل إبراز التقرير النهائي.
          </p>
        </div>
      )}

      {/* STAGE 4: Final Detailed Report */}
      {stage === 'report' && evaluationResult && (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto py-2">
          {/* Notification Banner for Google Sheets Sync */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
              sheetSyncStatus?.success
                ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200'
                : 'bg-amber-950/70 border-amber-500 text-amber-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {sheetSyncStatus?.success ? (
                <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 text-amber-400 shrink-0" />
              )}
              <div className="text-xs">
                <p className="font-bold">
                  {sheetSyncStatus?.success
                    ? 'تم إرسال التقرير بنجاح وتدوينه في Google Sheets!'
                    : 'تنبيه بخصوص مزامنة Google Sheets:'}
                </p>
                <p className="text-[11px] opacity-90">
                  {sheetSyncStatus?.success
                    ? 'تم حفظ الصف متضمناً: الولاية، الاسم واللقب، الصفة النقابية، نسبة الولاء، والعلامات التفصيلية.'
                    : sheetSyncStatus?.error || 'يمكنك مراجعة صلاحيات الحساب أو معاينة التقرير مباشرة.'}
                </p>
              </div>
            </div>

            {sheetSyncStatus?.spreadsheetUrl && (
              <a
                href={sheetSyncStatus.spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-white text-emerald-900 font-bold text-xs flex items-center gap-1.5 shrink-0 hover:bg-stone-100 transition shadow"
              >
                <span>فتح الشيت</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Report Card */}
          <div
            className={`border-2 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 ${
              isDarkMode
                ? 'bg-slate-950 border-amber-500/40 text-stone-100'
                : 'bg-stone-50 border-stone-300 text-stone-900'
            }`}
          >
            {/* Header of Report */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-red-600 text-white flex items-center justify-center font-black text-lg">
                  SNTE
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold font-display text-amber-300">
                    تقرير أهلية القيادة والولاء النقابي
                  </h3>
                  <p className="text-xs text-stone-400">
                    النقابة الوطنية لعمال التربية · مخرجات بوسعادة 2026
                  </p>
                </div>
              </div>

              <div className="text-left">
                <span className="text-[11px] text-stone-400 block">تاريخ الإصدار:</span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {evaluationResult.timestamp}
                </span>
              </div>
            </div>

            {/* Candidate Metadata Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-stone-900/40 border border-stone-800 text-xs">
              <div>
                <span className="text-stone-400 block text-[11px]">الاسم واللقب:</span>
                <span className="font-bold text-white text-sm">{evaluationResult.candidateName}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">الولاية:</span>
                <span className="font-bold text-amber-300 text-sm">{evaluationResult.wilaya}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">الصفة النقابية:</span>
                <span className="font-bold text-emerald-400 text-sm">{evaluationResult.unionRole}</span>
              </div>
            </div>

            {/* Score & Tier Showcase */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-gradient-to-l from-emerald-950/60 via-slate-900 to-red-950/40 border border-emerald-500/30">
              <div className="flex flex-col items-center justify-center w-36 h-36 rounded-full border-4 border-amber-400 bg-slate-950/90 shrink-0 shadow-xl">
                <span className="text-3xl font-black text-amber-300 font-mono">
                  {evaluationResult.loyaltyPercentage}%
                </span>
                <span className="text-[11px] font-bold text-stone-300">نسبة الولاء النقابي</span>
              </div>

              <div className="flex-1 text-center sm:text-right flex flex-col gap-2">
                <span className="text-xs font-bold text-stone-400">التقدير العام للأهلية:</span>
                <h4 className="text-base sm:text-lg font-black text-amber-200">
                  {evaluationResult.evaluationTier}
                </h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  تم التقييم بناءً على استجابات المنخرط في المواقف التنظيمية، والسلوكية أثناء الأزمات،
                  والإحاطة بالضمانات والحقوق القانونية للنقابة طبقاً للقانون 23/02.
                </p>
              </div>
            </div>

            {/* Scores by 3 Categories */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Organizational */}
              <div className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-950/20 flex flex-col gap-1 text-center sm:text-right">
                <span className="text-xs font-bold text-blue-300">الجانب التنظيمي:</span>
                <div className="text-xl font-bold font-mono text-white">
                  {evaluationResult.organizationalScore} / 30
                </div>
                <span className="text-[10px] text-stone-400">الهيكلة، النصاب، والمالية</span>
              </div>

              {/* Behavioral */}
              <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-950/20 flex flex-col gap-1 text-center sm:text-right">
                <span className="text-xs font-bold text-red-300">الجانب السلوكي والمواقفي:</span>
                <div className="text-xl font-bold font-mono text-white">
                  {evaluationResult.behavioralScore} / 30
                </div>
                <span className="text-[10px] text-stone-400">الحوار، الاستقلالية، وضبط النفس</span>
              </div>

              {/* Legal */}
              <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 flex flex-col gap-1 text-center sm:text-right">
                <span className="text-xs font-bold text-emerald-300">الجانب القانوني والتشريعي:</span>
                <div className="text-xl font-bold font-mono text-white">
                  {evaluationResult.legalScore} / 30
                </div>
                <span className="text-[10px] text-stone-400">القانون 23/02، الانضباط، والعهدات</span>
              </div>
            </div>

            {/* Recommendations */}
            <div className="flex flex-col gap-2 pt-2">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>توصيات وملاحظات القيادة النقابية للمترشح:</span>
              </span>
              <ul className="space-y-1.5 text-xs text-stone-300 pr-4 list-disc marker:text-amber-400">
                {evaluationResult.recommendations.map((rec, rIdx) => (
                  <li key={rIdx} className="leading-relaxed">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            {/* Reset / Re-run */}
            <div className="pt-4 border-t border-stone-800 flex justify-end">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-stone-200 border border-slate-700 flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إجراء تقييم لمنخرط آخر</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
