import React, { useState, useRef } from 'react';
import {
  Award,
  CheckCircle,
  User,
  MapPin,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Download,
  Share2,
  Printer,
  RotateCcw,
  Loader2,
  Shuffle,
  Lock,
  Check,
  FileText
} from 'lucide-react';
import {
  ALGERIA_WILAYAS,
  UNION_ROLES,
  SimulationQuestion,
  SimulationResult,
  generateExpandedSimulation
} from '../data/simulationData';
import { downloadCertificateAsPDF } from '../utils/certificatePdfGenerator';

export const UnionCadreSimulation: React.FC<{
  isDarkMode: boolean;
}> = ({ isDarkMode }) => {
  // Step: 'info' -> 'questions' -> 'report'
  const [stage, setStage] = useState<'info' | 'questions' | 'report'>('info');

  // Candidate Profile
  const [candidateName, setCandidateName] = useState<string>('');
  const [wilaya, setWilaya] = useState<string>(ALGERIA_WILAYAS[15]); // 16 - الجزائر العاصمة
  const [unionRole, setUnionRole] = useState<string>(UNION_ROLES[0]);

  // Anti-Cheat Dynamic Simulation Session State (15 In-depth Questions)
  const [activeQuestions, setActiveQuestions] = useState<SimulationQuestion[]>([]);
  const [sessionCode, setSessionCode] = useState<string>('');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<{ [qId: number]: number }>({});

  // Result & Certificate State
  const [evaluationResult, setEvaluationResult] = useState<SimulationResult | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);
  const [shareSuccess, setShareSuccess] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const certificateRef = useRef<HTMLDivElement>(null);

  /**
   * Starts a cheat-proof randomized simulation:
   * 15 in-depth scenario questions (5 Organizational, 5 Behavioral/Leadership, 5 Legal)
   */
  const handleStartSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim()) return;

    // Generate fresh randomized, non-repeating 15-question set
    const { questions, sessionCode: newSessionCode } = generateExpandedSimulation(5);
    setActiveQuestions(questions);
    setSessionCode(newSessionCode);
    setAnswers({});
    setCurrentQuestionIdx(0);
    setStage('questions');
  };

  const currentQ: SimulationQuestion | undefined = activeQuestions[currentQuestionIdx];

  const handleSelectOption = (optIdx: number) => {
    if (!currentQ) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optIdx
    }));
  };

  /**
   * Computes the evaluation report across all 3 criteria (max 150 points)
   */
  const calculateFullReport = (): SimulationResult => {
    let orgScore = 0;
    let behScore = 0;
    let legScore = 0;

    activeQuestions.forEach((q) => {
      const selectedIdx = answers[q.id];
      if (selectedIdx !== undefined) {
        const option = q.options[selectedIdx];
        if (option) {
          if (q.category === 'تنظيمي ومؤسساتي') orgScore += option.score;
          if (q.category === 'سلوكي وقيادي وتفاوضي') behScore += option.score;
          if (q.category === 'قانوني وتشريعي') legScore += option.score;
        }
      }
    });

    const totalRaw = orgScore + behScore + legScore; // max 150 points (3 axes x 5 questions x 10 points)
    const loyaltyPct = Math.round((totalRaw / 150) * 100);

    let tier = '';
    let certificateTitle = '';
    let tierColor = '';
    const recommendations: string[] = [];

    if (loyaltyPct >= 85) {
      tier = 'كادر نقابي قيادي مؤهل بامتياز (ولاء نقابي صلب)';
      certificateTitle = 'شهادة الكفاءة القيادية العليا والولاء النقابي';
      tierColor = 'emerald';
      recommendations.push('أهلية عالية للترشح للمسؤوليات التنفيذية بالمكاتب الولائية والوطنية لمؤتمر 2026.');
      recommendations.push('القدرة على قيادة الأزمات بالحوار المؤسساتي والانضباط المالي والتنظيمي الصارم.');
      recommendations.push('تأهيل المترشح للمشاركة في تأطير الملتقيات والجامعات الصيفية وأيام التكوين.');
    } else if (loyaltyPct >= 70) {
      tier = 'مناضل نقابي كفء وجدير بالثقة (ولاء نقابي جيد)';
      certificateTitle = 'شهادة الجدارة والأهلية النقابية المتقدمة';
      tierColor = 'blue';
      recommendations.push('تعزيز الاطلاع المعمق على تفاصيل النظام الداخلي وبنود القانون 23/02.');
      recommendations.push('إشراكه في لجان العمل المتخصصة لتنمية المهارات التفاوضية والقانونية مع الإدارة.');
      recommendations.push('مناسب جداً للمهام التنسيقية والتنظيمية بالبلديات وفروع المؤسسات التربوية.');
    } else if (loyaltyPct >= 50) {
      tier = 'منخرط في مرحلة التدرج النقابي (ولاء نقابي متوسط)';
      certificateTitle = 'شهادة إتمام المحاكاة ومستوى التدرج النقابي القاعدي';
      tierColor = 'amber';
      recommendations.push('يحتاج إلى دورات تكوينية مكثفة في ميثاق أخلاقيات العمل النقابي وفنون التفاوض.');
      recommendations.push('ضرورة الالتزام بالتدرج الهيكلي وضبط النفس أثناء الأزمات والنزاعات الميدانية.');
      recommendations.push('التركيز على فهم اختصاصات الهيئات لتجنب تضارب الصلاحيات والسحب المالي.');
    } else {
      tier = 'مستوى غير مؤهل حالياً للمسؤولية القيادية (يحتاج تقويم وتأهيل)';
      certificateTitle = 'إفادة مشاركة في تقييم الكفاءة النقابية (تحت الاستدراك)';
      tierColor = 'red';
      recommendations.push('تسجيل خروقات للمفاهيم الأساسية للحياد واستقلالية النقابة والسلم الهيكلي.');
      recommendations.push('إلزامه بحضور أيام دراسية حول الحقوق والواجبات قبل منحه أي تفويض رسمي.');
      recommendations.push('إعادة التقييم بعد عهدة تكوينية في هياكل الفرع النقابي القاعدي.');
    }

    const reportText = `شهادة إثبات الأهلية والكفاءة القيادية والولاء النقابي - SNTE 2026:
- الاسم واللقب: ${candidateName}
- الولاية: ${wilaya}
- الصفة النقابية: ${unionRole}
- رمز الشهادة المعتمد: ${sessionCode}
- نسبة الولاء والجاهزية القيادية: ${loyaltyPct}% (${tier})
- الجانب التنظيمي والمؤسساتي: ${orgScore}/50
- الجانب السلوكي والقيادي والتفاوضي: ${behScore}/50
- الجانب القانوني والتشريعي: ${legScore}/50
- تاريخ الإصدار: ${new Date().toLocaleDateString('ar-DZ')}`;

    return {
      sessionCode,
      candidateName,
      wilaya,
      unionRole,
      overallScore: totalRaw,
      maxScore: 150,
      loyaltyPercentage: loyaltyPct,
      organizationalScore: orgScore,
      maxOrgScore: 50,
      behavioralScore: behScore,
      maxBehScore: 50,
      legalScore: legScore,
      maxLegScore: 50,
      evaluationTier: tier,
      certificateTitle,
      tierColor,
      recommendations,
      detailedReport: reportText,
      timestamp: new Date().toLocaleDateString('ar-DZ')
    };
  };

  /**
   * Finalizes quiz and shows the Certificate
   */
  const handleFinishSimulation = () => {
    const result = calculateFullReport();
    setEvaluationResult(result);
    setStage('report');
  };

  /**
   * Exports the certificate element to a high-res PDF
   */
  const handleDownloadPDF = async () => {
    if (!evaluationResult) return;
    setIsGeneratingPDF(true);
    try {
      await downloadCertificateAsPDF(
        'snte-official-certificate-container',
        evaluationResult.candidateName,
        evaluationResult.sessionCode
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  /**
   * Direct printing using window.print()
   */
  const handlePrintCertificate = () => {
    window.print();
  };

  /**
   * Shares the certificate details with the official union portal link
   */
  const handleShareCertificate = async () => {
    if (!evaluationResult) return;
    const shareText = `📜 ${evaluationResult.certificateTitle}
النقابة الوطنية لعمال التربية (SNTE) - مؤتمر بوسعادة 2026

تشهد النقابة بأن الإطار النقابي: ${evaluationResult.candidateName} (${evaluationResult.wilaya})
قد أحرز نسبة ولاء وجاهزية قيادية: ${evaluationResult.loyaltyPercentage}%
التقدير العام: ${evaluationResult.evaluationTier}
رمز التحقق: ${evaluationResult.sessionCode}

رابط البوابة الرقمية الرسمية للنقابة:
https://hamidibachireduc-png.github.io/sntedz2026/`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: evaluationResult.certificateTitle,
          text: shareText,
          url: 'https://hamidibachireduc-png.github.io/sntedz2026/'
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2500);
      } catch (err) {
        // cancelled
      }
    } else {
      navigator.clipboard.writeText(shareText);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleReset = () => {
    setStage('info');
    setAnswers({});
    setCurrentQuestionIdx(0);
    setEvaluationResult(null);
  };

  return (
    <div
      className={`border-2 rounded-3xl p-4 sm:p-7 shadow-2xl transition-all duration-300 ${
        isDarkMode
          ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-emerald-500/40 text-stone-100'
          : 'bg-white border-emerald-700/30 text-stone-900 shadow-xl'
      }`}
    >
      {/* Simulation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 mb-6 border-emerald-500/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-6 rounded-full bg-red-600 inline-block shadow-sm" />
            <h2
              className={`text-xl sm:text-2xl font-black font-display tracking-tight ${
                isDarkMode ? 'text-amber-300' : 'text-emerald-950'
              }`}
            >
              محاكاة أهلية النخب والشهادة النقابية الرسمية
            </h2>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-700 text-white">
              مخرجات مؤتمر بوسعادة 2026
            </span>
          </div>
          <p
            className={`text-xs sm:text-sm mt-1 font-semibold ${
              isDarkMode ? 'text-emerald-400' : 'text-emerald-800'
            }`}
          >
            امتحان شامل ومعمق (15 موقفاً وسيناريو) لقياس شخصية الإطار النقابي مع استخراج شهادة PDF رسمية تثبت المستوى
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
              isDarkMode
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                : 'bg-emerald-50 text-emerald-800 border-emerald-300'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>شهادة كفاءة رسمية بصيغة PDF</span>
          </span>
        </div>
      </div>

      {/* ================= STAGE 1: Candidate Entry ================= */}
      {stage === 'info' && (
        <form onSubmit={handleStartSimulation} className="max-w-2xl mx-auto flex flex-col gap-5 py-2">
          <div
            className={`p-5 rounded-2xl border text-xs sm:text-sm shadow-sm ${
              isDarkMode
                ? 'bg-slate-950/80 border-amber-500/30 text-stone-200'
                : 'bg-emerald-50/80 border-emerald-300 text-stone-800'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-amber-400 mb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>دليل امتحان الأهلية القيادية واستصدار الشهادة:</span>
            </div>
            <p className="leading-relaxed mb-2.5">
              تمت مضاعفة محاور الاختبار إلى <strong>15 سؤالاً وموقفاً ميدانياً معمقاً</strong> للإحاطة بكافة جوانب شخصية النقابي (القيادة، التفاوض، النزاهة، استقلالية الموقف، إدارة الأزمات، والتحكم في القانون 23/02).
            </p>
            <ul className="space-y-1.5 leading-relaxed pr-4 list-disc marker:text-emerald-500 text-xs">
              <li>
                <strong>أسئلة متجددة ومختلطة:</strong> في كل محاولة، يتم سحب نموذج اختبار فريد ومختلط الخيارات لمنع الغش وحفظ الأجوبة.
              </li>
              <li>
                <strong>شهادة PDF معتمدة:</strong> عند إنهاء المحاكاة، يتم توليد <strong>شهادة رسمية تثبت المستوى والولاء النقابي</strong> تحمل ختم النقابة ورمز التوثيق ويمكن تحميلها بصيغة PDF عالية الدقة وطباعتها ومشاركتها فوراً.
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Candidate Name */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-bold flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-500" />
                <span>الاسم واللقب الكامل للمترشح (يكتب في الشهادة الرسمية): *</span>
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

          <button
            type="submit"
            className="mt-3 py-3 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-emerald-700 to-emerald-800 hover:from-red-500 hover:to-emerald-700 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Shuffle className="w-4 h-4 text-amber-300" />
            <span>بدء الامتحان الموسّع للأهلية النقابية (15 سؤالاً)</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* ================= STAGE 2: Anti-Cheat Randomized 15-Question Flow ================= */}
      {stage === 'questions' && currentQ && (
        <div className="flex flex-col gap-5 max-w-3xl mx-auto py-2">
          {/* Progress & Anti-Cheat Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-700 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-400 font-mono text-xs">
                السؤال {currentQuestionIdx + 1} من {activeQuestions.length}
              </span>
              <span>·</span>
              <span
                className={`px-2.5 py-0.5 rounded-full font-bold border text-[11px] ${
                  currentQ.category === 'تنظيمي ومؤسساتي'
                    ? 'bg-blue-950 text-blue-300 border-blue-500/40'
                    : currentQ.category === 'سلوكي وقيادي وتفاوضي'
                    ? 'bg-red-950 text-red-300 border-red-500/40'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                }`}
              >
                المحور: {currentQ.category}
              </span>
            </div>

            {/* Anti-Cheat Session Code */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-stone-400 flex items-center gap-1 font-mono bg-stone-900/60 px-2 py-0.5 rounded border border-stone-700">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>كود التحقق:</span>
                <strong className="text-amber-300">{sessionCode}</strong>
              </span>
            </div>
          </div>

          {/* Question Box */}
          <div
            className={`p-5 rounded-2xl border flex flex-col gap-3 shadow-md ${
              isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-stone-50 border-stone-200'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-emerald-400">{currentQ.title}</span>
              <span className="text-[10px] text-stone-400 font-mono">10 نقاط</span>
            </div>

            {currentQ.scenario && (
              <div
                className={`p-3 rounded-xl border text-xs leading-relaxed ${
                  isDarkMode
                    ? 'bg-slate-900 border-amber-500/30 text-amber-100'
                    : 'bg-amber-50 border-amber-300 text-stone-900'
                }`}
              >
                <span className="font-bold text-amber-500 block mb-0.5">📌 الموقف العملي / سيناريو الأزمة:</span>
                {currentQ.scenario}
              </div>
            )}

            <h3 className="text-base sm:text-lg font-bold leading-relaxed">
              {currentQ.question}
            </h3>

            {/* Answer Options (Scrambled & Cheat-proof) */}
            <div className="flex flex-col gap-2.5 mt-2">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = answers[currentQ.id] === optIdx;
                return (
                  <button
                    key={opt.id || optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`p-3.5 rounded-xl border text-right text-xs sm:text-sm font-medium transition flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-800/30 border-emerald-500 text-emerald-200 ring-2 ring-emerald-400/40'
                        : isDarkMode
                        ? 'bg-slate-900 border-slate-800 text-stone-300 hover:border-slate-700 hover:bg-slate-850'
                        : 'bg-white border-stone-300 text-stone-800 hover:border-emerald-600 hover:bg-stone-50'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
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
              className="px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
              <span>السؤال السابق</span>
            </button>

            {currentQuestionIdx < activeQuestions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIdx((p) => p + 1)}
                disabled={answers[currentQ.id] === undefined}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none transition shadow cursor-pointer"
              >
                <span>السؤال التالي</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinishSimulation}
                disabled={answers[currentQ.id] === undefined}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-emerald-700 hover:from-red-500 hover:to-emerald-600 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg disabled:opacity-30 transition cursor-pointer"
              >
                <Award className="w-4 h-4 text-amber-300" />
                <span>إنهاء الامتحان واستخراج الشهادة الرسمية</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ================= STAGE 3: Final Official PDF Certificate ================= */}
      {stage === 'report' && evaluationResult && (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto py-2">
          {/* Action Ribbon: PDF Download, Print, Share, New Test */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-stone-900 border border-emerald-500/40 text-white shadow-xl">
            <div className="flex items-center gap-2.5">
              <Award className="w-6 h-6 text-amber-400 shrink-0" />
              <div>
                <h4 className="font-black text-sm text-amber-300 font-display">
                  تم استخراج شهادة الأهلية والولاء النقابي الرسمية بنجاح!
                </h4>
                <p className="text-[11px] text-stone-300">
                  شهادة رقم: <strong className="font-mono text-emerald-400">{evaluationResult.sessionCode}</strong> تثبت مستوى الإطار النقابي بدقة.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* PDF Download Button */}
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs flex items-center gap-1.5 shadow-lg transition cursor-pointer disabled:opacity-50"
              >
                {isGeneratingPDF ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 text-amber-300" />
                )}
                <span>{isGeneratingPDF ? 'جاري تجهيز PDF...' : 'تحميل الشهادة PDF'}</span>
              </button>

              {/* Share Certificate Button */}
              <button
                onClick={handleShareCertificate}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
              >
                {shareSuccess || copiedLink ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
                <span>{shareSuccess || copiedLink ? 'تمت المشاركة!' : 'مشاركة الشهادة'}</span>
              </button>

              {/* Print Button */}
              <button
                onClick={handlePrintCertificate}
                className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-4 h-4 text-stone-300" />
                <span>طباعة</span>
              </button>

              {/* Retake / Re-run */}
              <button
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-stone-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>امتحان جديد</span>
              </button>
            </div>
          </div>

          {/* ================= THE CERTIFICATE ITSELF (PRESTIGE PRINTABLE CONTAINER) ================= */}
          <div className="overflow-x-auto pb-4">
            <div
              id="snte-official-certificate-container"
              ref={certificateRef}
              dir="rtl"
              className="w-[1000px] min-h-[700px] mx-auto p-10 bg-white text-stone-900 border-[14px] border-double border-emerald-900 relative shadow-2xl rounded-xl font-sans select-none"
              style={{
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
                background: 'radial-gradient(circle at center, #ffffff 65%, #f7fdf9 100%)'
              }}
            >
              {/* Inner Decorative Golden Border */}
              <div className="absolute inset-2 border-2 border-amber-600/40 pointer-events-none rounded" />
              <div className="absolute inset-4 border border-emerald-800/20 pointer-events-none rounded" />

              {/* Corner Traditional Algerian Ornaments */}
              <div className="absolute top-5 right-5 text-amber-600 text-2xl font-serif">❖</div>
              <div className="absolute top-5 left-5 text-amber-600 text-2xl font-serif">❖</div>
              <div className="absolute bottom-5 right-5 text-amber-600 text-2xl font-serif">❖</div>
              <div className="absolute bottom-5 left-5 text-amber-600 text-2xl font-serif">❖</div>

              {/* Top National & Union Header */}
              <div className="flex items-center justify-between border-b-2 border-emerald-800/40 pb-4 mb-6">
                <div className="text-right">
                  <h4 className="text-sm font-bold text-stone-700">
                    الجمهورية الجزائرية الديمقراطية الشعبية
                  </h4>
                  <h3 className="text-base font-black text-emerald-900 font-display mt-0.5">
                    النقابة الوطنية لعمال التربية (SNTE)
                  </h3>
                  <p className="text-[11px] font-bold text-red-700">
                    المؤتمر الوطني التاسع - بوسعادة 2026
                  </p>
                </div>

                {/* Central Emblem / Logo */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full border-2 border-amber-500 bg-gradient-to-br from-emerald-800 via-emerald-700 to-red-700 text-white flex items-center justify-center font-black text-xl shadow-lg">
                    <span>SNTE</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-950 mt-1">
                    أصالة · استقلالية · ديمقراطية
                  </span>
                </div>

                <div className="text-left font-mono text-xs">
                  <span className="text-stone-500 block text-[10px]">رقم الشهادة التسلسلي:</span>
                  <span className="font-bold text-emerald-800 text-sm tracking-wider">
                    {evaluationResult.sessionCode}
                  </span>
                  <span className="text-stone-500 block text-[10px] mt-1">تاريخ الإصدار:</span>
                  <span className="font-bold text-stone-800">{evaluationResult.timestamp}</span>
                </div>
              </div>

              {/* Certificate Main Title */}
              <div className="text-center my-4">
                <span className="text-xs font-bold text-amber-700 tracking-widest uppercase block mb-1">
                  وثيقة رسمية معتمدة لإثبات الكفاءة
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 font-display tracking-tight border-b-2 border-amber-500/60 inline-block pb-2 px-8">
                  {evaluationResult.certificateTitle}
                </h1>
              </div>

              {/* Candidate Attestation Body */}
              <div className="text-center my-6 space-y-4 px-8">
                <p className="text-base text-stone-700 leading-relaxed">
                  تُشهد القيادة الوطنية للنقابة الوطنية لعمال التربية بأن الإطار النقابي:
                </p>

                <div className="py-2">
                  <span className="text-2xl sm:text-3xl font-black text-red-700 font-display px-6 py-1 bg-amber-50 rounded-xl border border-amber-300 inline-block shadow-sm">
                    {evaluationResult.candidateName}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-6 text-sm text-stone-800 font-semibold">
                  <span>
                    الولاية: <strong className="text-emerald-900 font-bold">{evaluationResult.wilaya}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    الصفة النقابية: <strong className="text-emerald-900 font-bold">{evaluationResult.unionRole}</strong>
                  </span>
                </div>

                <p className="text-sm text-stone-700 leading-relaxed max-w-2xl mx-auto">
                  قد اجتاز بنجاح <strong>امتحان تقييم الأهلية النقابية والجاهزية القيادية الشامل</strong> (15 محوراً وسيناريو ميدانياً معقداً) وفق مخرجات مؤتمر بوسعادة 2026 وأحكام القانون 23/02، وأثبت المستوى التالي:
                </p>
              </div>

              {/* Score Showcase & Tier Badge */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 my-6 px-4">
                {/* Overall Loyalty Score */}
                <div className="p-4 rounded-xl bg-emerald-900 text-white flex flex-col items-center justify-center border-2 border-amber-400 shadow-md">
                  <span className="text-3xl font-black text-amber-300 font-mono">
                    {evaluationResult.loyaltyPercentage}%
                  </span>
                  <span className="text-xs font-bold mt-1 text-emerald-100">
                    نسبة الولاء والجاهزية
                  </span>
                </div>

                {/* Organizational Score */}
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-300 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-bold text-blue-900 mb-0.5">المحور التنظيمي</span>
                  <span className="text-xl font-black text-blue-950 font-mono">
                    {evaluationResult.organizationalScore} / 50
                  </span>
                  <span className="text-[10px] text-stone-600">الهيكلة والمالية والعهدة</span>
                </div>

                {/* Behavioral & Leadership Score */}
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-300 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-bold text-red-900 mb-0.5">المحور السلوكي والقيادي</span>
                  <span className="text-xl font-black text-red-950 font-mono">
                    {evaluationResult.behavioralScore} / 50
                  </span>
                  <span className="text-[10px] text-stone-600">التفاوض والاستقلالية والأخلاق</span>
                </div>

                {/* Legal Score */}
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-bold text-emerald-900 mb-0.5">المحور القانوني والتشريعي</span>
                  <span className="text-xl font-black text-emerald-950 font-mono">
                    {evaluationResult.legalScore} / 50
                  </span>
                  <span className="text-[10px] text-stone-600">القانون 23/02 والحماية النقابية</span>
                </div>
              </div>

              {/* Evaluation Tier Statement */}
              <div className="text-center py-2 px-4 bg-emerald-50/70 border border-emerald-200 rounded-xl mx-4 mb-6">
                <span className="text-xs font-bold text-stone-600 block mb-0.5">التقدير العام المعتمد:</span>
                <span className="text-base font-black text-emerald-950">
                  {evaluationResult.evaluationTier}
                </span>
              </div>

              {/* Signatures and Official Union Seal */}
              <div className="flex items-end justify-between px-8 pt-4 mt-6 border-t border-stone-300">
                {/* Committee Signature */}
                <div className="text-center w-52">
                  <span className="text-xs font-bold text-stone-700 block mb-2">
                    لجنة التقييم والتكوين النقابي
                  </span>
                  <div className="h-12 flex items-center justify-center text-xs italic text-stone-500 font-serif border-b border-stone-400 border-dashed">
                    المصادقة والتأهيل
                  </div>
                </div>

                {/* Official Golden Union Seal Representation */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-full border-4 border-amber-600 bg-emerald-900 text-amber-300 flex flex-col items-center justify-center shadow-lg relative">
                    <span className="text-[9px] font-bold text-white uppercase tracking-tighter">الجمهورية الجزائرية</span>
                    <span className="text-xs font-black">خاتم رسمي</span>
                    <span className="text-[8px] font-bold text-amber-200">SNTE 2026</span>
                  </div>
                  <span className="text-[9px] text-stone-500 font-mono mt-1">الختم الوطني المعتمد</span>
                </div>

                {/* National Secretary General */}
                <div className="text-center w-52">
                  <span className="text-xs font-bold text-stone-700 block mb-2">
                    الأمانة الوطنية للنقابة
                  </span>
                  <div className="h-12 flex items-center justify-center text-xs italic text-stone-500 font-serif border-b border-stone-400 border-dashed">
                    الأمين العام الوطني
                  </div>
                </div>
              </div>

              {/* Footer Portal Link */}
              <div className="text-center mt-6 pt-2 border-t border-stone-200 text-[10px] text-stone-500 flex items-center justify-between px-2">
                <span>وثيقة مستخرجة من البوابة الرقمية للنقابة الوطنية لعمال التربية: hamidibachireduc-png.github.io/sntedz2026/</span>
                <span>رمز التوثيق: {evaluationResult.sessionCode}</span>
              </div>
            </div>
          </div>

          {/* Recommendations Card */}
          <div
            className={`border rounded-2xl p-5 shadow-lg ${
              isDarkMode ? 'bg-slate-950 border-stone-800 text-stone-100' : 'bg-stone-50 border-stone-200 text-stone-900'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-amber-400 mb-2 text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>توجيهات وملاحظات القيادة النقابية للمترشح بناءً على إجاباته:</span>
            </div>
            <ul className="space-y-1.5 text-xs text-stone-300 pr-4 list-disc marker:text-amber-400 leading-relaxed">
              {evaluationResult.recommendations.map((rec, rIdx) => (
                <li key={rIdx}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
