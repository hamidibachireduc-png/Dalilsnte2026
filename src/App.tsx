import React, { useState, useMemo, useEffect } from 'react';
import {
  BookOpen,
  Search,
  ChevronRight,
  ChevronLeft,
  HelpCircle,
  Award,
  Layers,
  FileText,
  Volume2,
  VolumeX,
  Bookmark,
  Sparkles,
  CheckCircle,
  XCircle,
  RotateCcw,
  ListOrdered,
  Maximize2,
  Download,
  Info,
  Share2,
  Copy,
  Check,
  Send,
  MessageCircle,
  Globe,
  Sun,
  Moon,
  ExternalLink,
  ShieldCheck,
  Mic,
  MicOff
} from 'lucide-react';
import {
  SNTE_BOOK_PAGES,
  SNTE_QUIZ_QUESTIONS,
  BookPageData,
  QuizQuestion
} from './data/snteBookData';
import {
  SnteLogoEmblem,
  QuestionerCharacter,
  UnionistCharacter,
  OrnamentalPlaqueCard
} from './components/BookCharacters';
import { UnionCadreSimulation } from './components/UnionCadreSimulation';

export default function App() {
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPartFilter, setSelectedPartFilter] = useState<string>('الكل');
  const [activeTab, setActiveTab] = useState<'book' | 'index' | 'quiz' | 'simulation'>('book');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isSpeechPlaying, setIsSpeechPlaying] = useState<boolean>(false);
  const [bookmarkedPages, setBookmarkedPages] = useState<number[]>([]);
  const [showImageModal, setShowImageModal] = useState<string | null>(null);

  // Voice Search State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceSupported, setVoiceSupported] = useState<boolean>(true);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);

  // Day / Night Mode State (true = night/dark, false = day/light)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Sharing state
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedContent, setCopiedContent] = useState<boolean>(false);

  // Official SNTE Digital Portal URL requested by user
  const SNTE_PORTAL_URL = 'https://hamidibachireduc-png.github.io/sntedz2026/';

  // Sync with URL hash / query on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get('page');
    if (pageParam) {
      const pNum = parseInt(pageParam, 10);
      if (!isNaN(pNum) && pNum >= 1 && pNum <= SNTE_BOOK_PAGES.length) {
        setCurrentPageIndex(pNum - 1);
      }
    }
  }, []);

  // Update URL search query quietly when page changes
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', String(currentPageIndex + 1));
    window.history.replaceState({}, '', url.toString());
  }, [currentPageIndex]);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  const currentPage: BookPageData = SNTE_BOOK_PAGES[currentPageIndex] || SNTE_BOOK_PAGES[0];

  // Filtered pages for table of contents
  const filteredPages = useMemo(() => {
    return SNTE_BOOK_PAGES.filter((page) => {
      const matchesPart =
        selectedPartFilter === 'الكل' || page.part.includes(selectedPartFilter);
      const matchesQuery =
        !searchQuery.trim() ||
        page.chapterTitle.includes(searchQuery) ||
        page.indexHeading.includes(searchQuery) ||
        page.mainQuestion.includes(searchQuery) ||
        page.posterTitle.includes(searchQuery) ||
        page.answerCards.some(
          (c) =>
            c.title.includes(searchQuery) ||
            c.description.includes(searchQuery) ||
            c.articleRef.includes(searchQuery)
        ) ||
        page.subQuestions.some(
          (sq) => sq.question.includes(searchQuery) || sq.answer.includes(searchQuery)
        );
      return matchesPart && matchesQuery;
    });
  }, [searchQuery, selectedPartFilter]);

  const toggleBookmark = (pageNum: number) => {
    setBookmarkedPages((prev) =>
      prev.includes(pageNum) ? prev.filter((p) => p !== pageNum) : [...prev, pageNum]
    );
  };

  const handleNextPage = () => {
    if (currentPageIndex < SNTE_BOOK_PAGES.length - 1) {
      setCurrentPageIndex((prev) => prev + 1);
      setSelectedCardId(null);
      stopSpeech();
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex((prev) => prev - 1);
      setSelectedCardId(null);
      stopSpeech();
    }
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeechPlaying(false);
    }
  };

  const handleTextToSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeechPlaying) {
      stopSpeech();
      return;
    }

    const textToRead = `
      السؤال: ${currentPage.mainQuestion}.
      الجواب من الأسنتيو: ${currentPage.unionistIntro}.
      ${currentPage.answerCards.map((c, i) => `النقطة ${i + 1}: ${c.title}. ${c.description}`).join('. ')}
      الخلاصة: ${currentPage.keyTakeaway}
    `;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeechPlaying(false);
    utterance.onerror = () => setIsSpeechPlaying(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeechPlaying(true);
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceSupported(false);
      setVoiceFeedback('المتصفح الحالي لا يدعم خاصية التعرف على الصوت. جرب متصفح Chrome.');
      setTimeout(() => setVoiceFeedback(null), 4000);
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-DZ'; // Algerian Arabic & Arabic standard
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceFeedback('تفضل بالتحدث الآن.. استمع إليك (مثال: "الانضباط"، "الأمانة الولائية"، "الاشتراكات")...');
      };

      recognition.onresult = (event: any) => {
        const spokenText = event.results[0][0].transcript;
        if (spokenText) {
          setSearchQuery(spokenText);
          setVoiceFeedback(`تم البحث عن: "${spokenText}"`);
          setTimeout(() => setVoiceFeedback(null), 3500);
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setVoiceFeedback('يرجى السماح بالوصول إلى الميكروفون من إعدادات المتصفح.');
        } else if (event.error === 'no-speech') {
          setVoiceFeedback('لم يتم التقاط أي صوت، يرجى المحاولة والتحدث بصوت واضح.');
        } else {
          setVoiceFeedback('تعذر التعرف على الصوت، يرجى المحاولة مجدداً.');
        }
        setTimeout(() => setVoiceFeedback(null), 4000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Error starting recognition:', err);
      setIsListening(false);
      setVoiceFeedback('حدث خطأ أثناء تشغيل الميكروفون.');
      setTimeout(() => setVoiceFeedback(null), 3000);
    }
  };

  const handleQuizOptionSelect = (questionId: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
  };

  const handleQuizReset = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const calculateScore = () => {
    let score = 0;
    SNTE_QUIZ_QUESTIONS.forEach((q) => {
      if (quizAnswers[q.id] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  const getShareableText = () => {
    const cardsText = currentPage.answerCards
      .map((c, i) => `▪ ${c.title}: ${c.description}`)
      .join('\n\n');

    return `📌 كتاب "أنت تسأل والأسنتيو تجيب" (الدليل النقابي SNTE 2026):
📖 ${currentPage.chapterTitle} (${currentPage.articlesRange})

❓ السؤال:
"${currentPage.mainQuestion}"

🟢 جواب الأسنتيو:
${currentPage.unionistIntro}

${cardsText}

💡 الخلاصة:
"${currentPage.keyTakeaway}"

🌐 البوابة الرقمية للنقابة الوطنية لعمال التربية (SNTE):
${SNTE_PORTAL_URL}

🔗 رابط الصفحة في الكتاب التفاعلي:
${window.location.origin}${window.location.pathname}?page=${currentPage.pageNumber}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(SNTE_PORTAL_URL);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyFullContent = () => {
    navigator.clipboard.writeText(getShareableText());
    setCopiedContent(true);
    setTimeout(() => setCopiedContent(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `أنت تسأل والأسنتيو تجيب | ${currentPage.chapterTitle}`,
          text: `سؤال: ${currentPage.mainQuestion}\nخلاصة الأسنتيو: ${currentPage.keyTakeaway}\nالبوابة الرقمية: ${SNTE_PORTAL_URL}`,
          url: SNTE_PORTAL_URL
        });
      } catch {
        // user cancelled or fallback
      }
    } else {
      setShowShareModal(true);
    }
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(getShareableText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const shareToTelegram = () => {
    const shareUrl = encodeURIComponent(SNTE_PORTAL_URL);
    const text = encodeURIComponent(`أنت تسأل والأسنتيو تجيب: ${currentPage.chapterTitle}\n\nالسؤال: ${currentPage.mainQuestion}\n\nالخلاصة: ${currentPage.keyTakeaway}\n\nالبوابة الرقمية للأسنتيو: ${SNTE_PORTAL_URL}`);
    window.open(`https://t.me/share/url?url=${shareUrl}&text=${text}`, '_blank');
  };

  const shareToFacebook = () => {
    const shareUrl = encodeURIComponent(SNTE_PORTAL_URL);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank');
  };

  const shareToTwitter = () => {
    const shareUrl = encodeURIComponent(SNTE_PORTAL_URL);
    const text = encodeURIComponent(`أنت تسأل والأسنتيو تجيب: ${currentPage.chapterTitle}\n\nس: ${currentPage.mainQuestion}\nالبوابة الرقمية:`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`, '_blank');
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-body transition-colors duration-200 ${
        isDarkMode
          ? 'bg-arabesque-dark text-stone-100 selection:bg-amber-500/30 selection:text-amber-200'
          : 'bg-arabesque-light text-stone-900 selection:bg-emerald-600/20 selection:text-emerald-900'
      }`}
    >
      {/* Top Bar Header with Algerian Green & Red Trim */}
      <header
        className={`border-b sticky top-0 z-40 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3 shadow-md backdrop-blur-md transition-colors ${
          isDarkMode
            ? 'border-emerald-500/30 bg-slate-950/85'
            : 'border-emerald-700/20 bg-white/90 shadow-sm'
        }`}
      >
        {/* Brand / Logo + Algerian Tricolor indicator */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <SnteLogoEmblem size={44} className="shrink-0 drop-shadow-md" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span
                className={`text-base sm:text-lg font-bold font-display leading-tight ${
                  isDarkMode ? 'text-amber-300' : 'text-emerald-900'
                }`}
              >
                أنت تسأل والأسنتيو تجيب
              </span>
              <span className="flex items-center gap-0.5" title="الراية الوطنية الجزائرية">
                <span className="w-1.5 h-3.5 rounded-sm bg-emerald-600 inline-block" />
                <span className="w-1.5 h-3.5 rounded-sm bg-white border border-stone-300 inline-block" />
                <span className="w-1.5 h-3.5 rounded-sm bg-red-600 inline-block" />
              </span>
            </div>
            <span
              className={`text-[11px] font-semibold ${
                isDarkMode ? 'text-emerald-400' : 'text-emerald-700'
              }`}
            >
              الدليل النقابي التفاعلي · مؤتمر بوسعادة 2026
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav
          className={`flex items-center gap-1 sm:gap-2 p-1 rounded-xl border text-xs sm:text-sm transition-colors ${
            isDarkMode
              ? 'bg-slate-900/90 border-emerald-500/30'
              : 'bg-stone-100 border-stone-300'
          }`}
        >
          <button
            onClick={() => setActiveTab('book')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'book'
                ? 'bg-gradient-to-r from-emerald-700 to-emerald-800 text-white shadow'
                : isDarkMode
                ? 'text-stone-300 hover:text-white'
                : 'text-stone-700 hover:text-emerald-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">الكتاب التفاعلي</span>
            <span className="sm:hidden">الكتاب</span>
          </button>

          <button
            onClick={() => setActiveTab('index')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'index'
                ? 'bg-gradient-to-r from-emerald-700 to-emerald-800 text-white shadow'
                : isDarkMode
                ? 'text-stone-300 hover:text-white'
                : 'text-stone-700 hover:text-emerald-800'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>الفهرس ({SNTE_BOOK_PAGES.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'quiz'
                ? 'bg-gradient-to-r from-red-700 to-red-800 text-white shadow'
                : isDarkMode
                ? 'text-stone-300 hover:text-white'
                : 'text-stone-700 hover:text-red-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">اختبر معلوماتك</span>
            <span className="sm:hidden">اختبار</span>
          </button>

          <button
            onClick={() => setActiveTab('simulation')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'simulation'
                ? 'bg-gradient-to-r from-amber-600 to-emerald-700 text-white shadow'
                : isDarkMode
                ? 'text-stone-300 hover:text-white'
                : 'text-stone-700 hover:text-amber-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">محاكاة أهلية النخب</span>
            <span className="sm:hidden">محاكاة الأهلية</span>
          </button>
        </nav>

        {/* Utility Actions: Day/Night Switch + Official Portal Link */}
        <div className="flex items-center gap-2">
          {/* Day / Night Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            title={isDarkMode ? 'التحويل إلى شاشة النهار (الوضع العادي)' : 'التحويل إلى شاشة الليل'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              isDarkMode
                ? 'bg-slate-800 text-amber-300 border-amber-500/40 hover:bg-slate-700'
                : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50 shadow-sm'
            }`}
          >
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden md:inline">وضع النهار</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-700" />
                <span className="hidden md:inline">وضع الليل</span>
              </>
            )}
          </button>

          {/* Official SNTE Portal Direct Link */}
          <a
            href={SNTE_PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="زيارة البوابة الرقمية للنقابة"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-emerald-700 hover:from-red-500 hover:to-emerald-600 rounded-xl shadow transition"
          >
            <span>البوابة الرقمية</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Original Poster Preview Button */}
          <button
            onClick={() => setShowImageModal('/assets/aistudio/image_b1e47648.png')}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition ${
              isDarkMode
                ? 'text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30'
                : 'text-stone-700 bg-stone-100 hover:bg-stone-200 border-stone-300'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>الملصقات</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {activeTab === 'book' && (
          <div className="flex flex-col gap-6">
            {/* Top Chapter Breadcrumb & Page Controller */}
            <div
              className={`border rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl transition-colors ${
                isDarkMode
                  ? 'bg-slate-900/90 border-emerald-500/30'
                  : 'bg-white border-emerald-700/20 shadow-md text-stone-900'
              }`}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`px-2 py-0.5 rounded font-semibold border ${
                      isDarkMode
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    {currentPage.part}
                  </span>
                  <span className={isDarkMode ? 'text-stone-400' : 'text-stone-500'}>·</span>
                  <span
                    className={`font-mono text-[11px] font-bold ${
                      isDarkMode ? 'text-red-400' : 'text-red-700'
                    }`}
                  >
                    صفحات PDF: {currentPage.pdfPages}
                  </span>
                  <span className={isDarkMode ? 'text-stone-400' : 'text-stone-500'}>·</span>
                  <span className={`text-[11px] ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                    {currentPage.articlesRange}
                  </span>
                </div>
                <h1
                  className={`text-lg sm:text-xl font-bold font-display ${
                    isDarkMode ? 'text-white' : 'text-stone-900'
                  }`}
                >
                  {currentPage.chapterTitle}
                </h1>
              </div>

              {/* Page Controls */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={handleTextToSpeech}
                  title="قراءة صوتية"
                  className={`p-2 rounded-xl border transition ${
                    isSpeechPlaying
                      ? 'bg-red-600 text-white border-red-500 animate-pulse'
                      : isDarkMode
                      ? 'bg-slate-800 text-stone-300 border-slate-700 hover:text-white'
                      : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
                  }`}
                >
                  {isSpeechPlaying ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>

                <button
                  onClick={() => toggleBookmark(currentPage.pageNumber)}
                  title="حفظ الصفحة في المفضلة"
                  className={`p-2 rounded-xl border transition ${
                    bookmarkedPages.includes(currentPage.pageNumber)
                      ? 'bg-red-500/20 text-red-500 border-red-500/50'
                      : isDarkMode
                      ? 'bg-slate-800 text-stone-400 border-slate-700 hover:text-white'
                      : 'bg-stone-100 text-stone-600 border-stone-300 hover:bg-stone-200'
                  }`}
                >
                  <Bookmark className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setShowShareModal(true)}
                  title="مشاركة الصفحة والسؤال والجواب والبوابة الرقمية"
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold transition text-xs shadow-sm"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">مشاركة</span>
                </button>

                <div className={`h-6 w-px mx-1 ${isDarkMode ? 'bg-slate-700' : 'bg-stone-300'}`} />

                <button
                  onClick={handlePrevPage}
                  disabled={currentPageIndex === 0}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-semibold transition disabled:opacity-30 disabled:pointer-events-none ${
                    isDarkMode
                      ? 'bg-slate-800 hover:bg-slate-700 text-stone-200 border-slate-700'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>السابق</span>
                </button>

                <span
                  className={`text-xs font-mono font-bold px-2 ${
                    isDarkMode ? 'text-amber-300' : 'text-emerald-800'
                  }`}
                >
                  {currentPage.pageNumber} / {SNTE_BOOK_PAGES.length}
                </span>

                <button
                  onClick={handleNextPage}
                  disabled={currentPageIndex === SNTE_BOOK_PAGES.length - 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-700 hover:bg-red-600 text-white disabled:opacity-30 disabled:pointer-events-none transition text-xs sm:text-sm font-bold shadow-sm"
                >
                  <span>التالي</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* The Visual Dialog Arena (Person Asks vs Unionist Answers) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Questioner Side (Left/Top) */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <div
                  className={`border-2 rounded-3xl p-5 shadow-2xl relative overflow-hidden transition-colors ${
                    isDarkMode
                      ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-emerald-500/40 text-stone-100'
                      : 'bg-white border-emerald-600/40 text-stone-900 shadow-lg'
                  }`}
                >
                  {/* Decorative badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                        isDarkMode
                          ? 'bg-blue-900/60 text-blue-200 border-blue-400/40'
                          : 'bg-blue-50 text-blue-800 border-blue-300'
                      }`}
                    >
                      السائل: {currentPage.questionerRole}
                    </span>
                    <span
                      className={`text-2xl font-black font-display ${
                        isDarkMode ? 'text-red-400' : 'text-red-600'
                      }`}
                    >
                      أنت تسأل..؟
                    </span>
                  </div>

                  {/* Speech Bubble */}
                  <div
                    className={`relative rounded-2xl p-4 shadow-inner border transition-colors ${
                      isDarkMode
                        ? 'bg-slate-800/90 border-amber-400/30 text-amber-100'
                        : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  >
                    <div
                      className={`absolute -bottom-3 right-10 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] ${
                        isDarkMode ? 'border-t-slate-800' : 'border-t-stone-50'
                      }`}
                    ></div>
                    <p className="text-sm sm:text-base font-medium leading-relaxed">
                      &quot;{currentPage.mainQuestion}&quot;
                    </p>
                  </div>

                  {/* Character Illustration */}
                  <div className="w-48 mx-auto mt-4">
                    <QuestionerCharacter className="w-full h-auto" />
                  </div>

                  {/* Context Note */}
                  <div
                    className={`mt-4 pt-3 border-t text-[11px] text-center ${
                      isDarkMode ? 'border-slate-800 text-stone-400' : 'border-stone-200 text-stone-500'
                    }`}
                  >
                    مستوحى من فهرس الدليل النقابي لمخرجات مؤتمر بوسعادة 2026
                  </div>
                </div>

                {/* Sub-Questions Accordion for Deep Insights */}
                {currentPage.subQuestions && currentPage.subQuestions.length > 0 && (
                  <div
                    className={`border rounded-2xl p-4 flex flex-col gap-3 transition-colors ${
                      isDarkMode
                        ? 'bg-slate-900/80 border-slate-800'
                        : 'bg-white border-stone-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <HelpCircle
                        className={`w-4 h-4 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}
                      />
                      <span className={isDarkMode ? 'text-amber-300' : 'text-emerald-900'}>
                        أسئلة تدقيقية وتفاصيل إضافية:
                      </span>
                    </div>
                    {currentPage.subQuestions.map((sq, idx) => (
                      <div
                        key={idx}
                        className={`border rounded-xl p-3 text-xs transition-colors ${
                          isDarkMode
                            ? 'bg-slate-950/60 border-slate-800/80'
                            : 'bg-stone-50 border-stone-200'
                        }`}
                      >
                        <p
                          className={`font-bold mb-1 ${
                            isDarkMode ? 'text-red-400' : 'text-red-700'
                          }`}
                        >
                          س: {sq.question}
                        </p>
                        <p
                          className={`leading-relaxed mb-1.5 ${
                            isDarkMode ? 'text-stone-300' : 'text-stone-700'
                          }`}
                        >
                          ج: {sq.answer}
                        </p>
                        <span
                          className={`text-[10px] font-mono font-bold ${
                            isDarkMode ? 'text-emerald-400/90' : 'text-emerald-700'
                          }`}
                        >
                          {sq.articleRef}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Unionist Side (Right/Main Answer Deck) */}
              <div className="lg:col-span-8 flex flex-col gap-5">
                <div
                  className={`border-2 rounded-3xl p-5 sm:p-6 shadow-2xl relative transition-colors ${
                    isDarkMode
                      ? 'bg-gradient-to-b from-[#0A1A2F]/95 via-[#07241A]/95 to-[#091526]/95 border-emerald-500/50'
                      : 'bg-white border-emerald-700/30 shadow-lg text-stone-900'
                  }`}
                >
                  {/* Unionist Header */}
                  <div
                    className={`flex items-center justify-between pb-4 border-b mb-5 ${
                      isDarkMode ? 'border-amber-500/30' : 'border-stone-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-800 border-2 border-white flex items-center justify-center text-white font-extrabold text-sm shadow">
                        SNTE
                      </div>
                      <div>
                        <h2
                          className={`text-base sm:text-xl font-extrabold font-display ${
                            isDarkMode ? 'text-emerald-400' : 'text-emerald-900'
                          }`}
                        >
                          والأسنتيو تجيب..
                        </h2>
                        <p
                          className={`text-xs font-semibold ${
                            isDarkMode ? 'text-stone-300' : 'text-stone-600'
                          }`}
                        >
                          {currentPage.posterTitle}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`hidden sm:inline-block text-xs font-bold px-3 py-1 rounded-full border ${
                        isDarkMode
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}
                    >
                      الهيئة الرسمية للنقابة
                    </span>
                  </div>

                  {/* Intro sentence from Unionist */}
                  <div
                    className={`border-r-4 p-3 rounded-lg mb-5 text-sm ${
                      isDarkMode
                        ? 'bg-emerald-950/40 border-emerald-500 text-stone-200'
                        : 'bg-emerald-50/80 border-emerald-600 text-stone-800 font-medium'
                    }`}
                  >
                    <p className={`font-semibold ${isDarkMode ? 'text-emerald-200' : 'text-emerald-900'}`}>
                      {currentPage.unionistIntro}
                    </p>
                  </div>

                  {/* Answer Cards styled as ornamental banners like image_b1e47648 and image_9f17daeb */}
                  <div className="flex flex-col gap-3.5">
                    {currentPage.answerCards.map((card, idx) => (
                      <OrnamentalPlaqueCard
                        key={card.id}
                        card={card}
                        index={idx}
                        isLightMode={!isDarkMode}
                        isSelected={selectedCardId === card.id}
                        onClick={() =>
                          setSelectedCardId(selectedCardId === card.id ? null : card.id)
                        }
                      />
                    ))}
                  </div>

                  {/* Unionist Character Standing to the Side */}
                  <div
                    className={`mt-6 pt-4 border-t flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl transition-colors ${
                      isDarkMode
                        ? 'border-amber-500/20 bg-slate-950/50'
                        : 'border-stone-200 bg-stone-50'
                    }`}
                  >
                    <div className="w-24 sm:w-28 shrink-0">
                      <UnionistCharacter className="w-full h-auto" />
                    </div>
                    <div className="flex-1 text-center sm:text-right">
                      <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                        <Sparkles
                          className={`w-4 h-4 ${isDarkMode ? 'text-amber-400' : 'text-red-600'}`}
                        />
                        <span
                          className={`text-xs font-bold ${
                            isDarkMode ? 'text-amber-300' : 'text-red-700'
                          }`}
                        >
                          الخلاصة والرسالة النقابية المركزة:
                        </span>
                      </div>
                      <p
                        className={`text-xs sm:text-sm font-medium leading-relaxed ${
                          isDarkMode ? 'text-stone-200' : 'text-stone-800'
                        }`}
                      >
                        &quot;{currentPage.keyTakeaway}&quot;
                      </p>
                    </div>
                  </div>
                </div>

                {/* Optional Original Poster Reference Trigger */}
                {currentPage.referenceImage && (
                  <div
                    className={`border rounded-2xl p-3 flex items-center justify-between gap-4 transition-colors ${
                      isDarkMode
                        ? 'bg-slate-900/60 border-slate-800 text-stone-300'
                        : 'bg-white border-stone-200 text-stone-700 shadow-sm'
                    }`}
                  >
                    <span className="text-xs">
                      هذه الصفحة تتطابق مباشرة مع الملصق التوضيحي المعتمد في مكتب الأمانة
                    </span>
                    <button
                      onClick={() => setShowImageModal(currentPage.referenceImage!)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-bold transition ${
                        isDarkMode
                          ? 'bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-500/40'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}
                    >
                      معاينة الملصق المرجعي
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Table of Contents / Index */}
        {activeTab === 'index' && (
          <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-display text-amber-300">
                  فهرس موضوعات الدليل النقابي التفاعلي
                </h2>
                <p className="text-xs sm:text-sm text-stone-400">
                  مبوب وفق مخرجات المؤتمر السادس الاستثنائي ببوسعادة جوان 2026
                </p>
              </div>

              {/* Search & Filter */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isListening ? 'جاري الاستماع إليك...' : 'ابحث بالصوت أو النص...'}
                    className={`pr-9 pl-10 py-2 text-xs rounded-xl transition-all focus:outline-none w-56 sm:w-72 ${
                      isListening
                        ? 'border-2 border-red-500 bg-red-950/30 text-white animate-pulse'
                        : isDarkMode
                        ? 'bg-slate-950 border border-slate-700 text-stone-200 placeholder-stone-500 focus:border-amber-400'
                        : 'bg-white border border-stone-300 text-stone-900 placeholder-stone-400 focus:border-emerald-600 shadow-sm'
                    }`}
                  />

                  {/* Microphone Voice Search Button */}
                  <button
                    type="button"
                    onClick={handleVoiceSearch}
                    title={isListening ? 'إيقاف الاستماع' : 'البحث الصوتي عبر الميكروفون'}
                    className={`absolute left-1.5 p-1.5 rounded-lg transition-all ${
                      isListening
                        ? 'bg-red-600 text-white animate-bounce'
                        : isDarkMode
                        ? 'text-stone-400 hover:text-amber-300 hover:bg-slate-800'
                        : 'text-stone-500 hover:text-emerald-700 hover:bg-stone-100'
                    }`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>

                {/* Reset Search Button if has query */}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-[11px] px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition"
                  >
                    مسح
                  </button>
                )}

                <select
                  value={selectedPartFilter}
                  onChange={(e) => setSelectedPartFilter(e.target.value)}
                  className={`text-xs py-2 px-3 rounded-xl border focus:outline-none transition ${
                    isDarkMode
                      ? 'bg-slate-950 border-slate-700 text-stone-200 focus:border-amber-400'
                      : 'bg-white border-stone-300 text-stone-900 focus:border-emerald-600 shadow-sm'
                  }`}
                >
                  <option value="الكل">جميع الأبواب</option>
                  <option value="القانون الأساسي">القانون الأساسي</option>
                  <option value="النظام الداخلي">النظام الداخلي</option>
                </select>
              </div>
            </div>

            {/* Voice Recognition Feedback Banner */}
            {voiceFeedback && (
              <div
                className={`py-2 px-4 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 animate-fadeIn ${
                  isListening
                    ? 'bg-red-950/80 border border-red-500 text-red-200'
                    : 'bg-emerald-950/80 border border-emerald-500 text-emerald-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span>{voiceFeedback}</span>
                </div>
                <button
                  onClick={() => setVoiceFeedback(null)}
                  className="text-stone-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Match Counter and Quick Voice Search Suggestions */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-400 pt-1">
              <span>
                النتائج المطابقة: <strong className="text-amber-400 font-mono">{filteredPages.length}</strong> من أصل {SNTE_BOOK_PAGES.length} موضوع
              </span>

              {/* Quick suggestion tags */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="text-stone-500">جرب القول:</span>
                {['الانضباط', 'الأمانة الولائية', 'الاشتراكات', 'الترشح والانتخاب'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="px-2 py-0.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-stone-300 hover:text-amber-200 border border-slate-700 transition"
                  >
                    &quot;{tag}&quot;
                  </button>
                ))}
              </div>
            </div>

            {/* List of Pages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredPages.map((page) => (
                <div
                  key={page.id}
                  onClick={() => {
                    setCurrentPageIndex(page.pageNumber - 1);
                    setActiveTab('book');
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 group ${
                    currentPageIndex === page.pageNumber - 1
                      ? 'bg-emerald-950/60 border-amber-400 shadow-lg'
                      : 'bg-slate-950/70 border-slate-800 hover:border-amber-500/50 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-slate-900 border border-amber-500/30">
                      صفحة #{page.pageNumber}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-stone-300">
                      {page.part}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-200 transition">
                      {page.chapterTitle}
                    </h3>
                    <p className="text-xs text-emerald-400/90 mt-1 line-clamp-1">
                      {page.indexHeading}
                    </p>
                    <p className="text-xs text-stone-400 mt-1.5 line-clamp-2">
                      س: {page.mainQuestion}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-stone-500">
                    <span>{page.articlesRange}</span>
                    <span className="text-amber-400/80 group-hover:text-amber-300 flex items-center gap-1 font-semibold">
                      <span>افتح الصفحة</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Interactive Knowledge Quiz */}
        {activeTab === 'quiz' && (
          <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-display text-amber-300">
                  اختبر معرفتك بقوانين الأسنتيو 2026
                </h2>
                <p className="text-xs sm:text-sm text-stone-400">
                  أسئلة تطبيقية تفاعلية مستنبطة مباشرة من نصوص القانون الأساسي والنظام الداخلي
                </p>
              </div>

              {quizSubmitted && (
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-200 text-sm font-bold">
                    النتيجة: {calculateScore()} من {SNTE_QUIZ_QUESTIONS.length}
                  </div>
                  <button
                    onClick={handleQuizReset}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-stone-200 border border-slate-700 transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>إعادة الاختبار</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-6">
              {SNTE_QUIZ_QUESTIONS.map((q, qIndex) => {
                const selectedOption = quizAnswers[q.id];
                const isCorrect = selectedOption === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center text-xs font-bold font-mono">
                        {qIndex + 1}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-white">
                        {q.question}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1">
                      {q.options.map((option, optIdx) => {
                        let btnStyle =
                          'bg-slate-900 border-slate-700 text-stone-200 hover:border-amber-400';

                        if (selectedOption === optIdx) {
                          btnStyle =
                            'bg-amber-500/20 border-amber-400 text-amber-200 font-semibold';
                        }

                        if (quizSubmitted) {
                          if (optIdx === q.correctIndex) {
                            btnStyle =
                              'bg-emerald-950 border-emerald-500 text-emerald-200 font-bold';
                          } else if (selectedOption === optIdx && !isCorrect) {
                            btnStyle =
                              'bg-red-950 border-red-500 text-red-200 line-through';
                          } else {
                            btnStyle = 'opacity-40 border-slate-800';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={quizSubmitted}
                            onClick={() => handleQuizOptionSelect(q.id, optIdx)}
                            className={`p-3 rounded-xl border text-xs sm:text-sm text-right transition flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{option}</span>
                            {quizSubmitted && optIdx === q.correctIndex && (
                              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mr-2" />
                            )}
                            {quizSubmitted &&
                              selectedOption === optIdx &&
                              !isCorrect && (
                                <XCircle className="w-4 h-4 text-red-400 shrink-0 mr-2" />
                              )}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div className="mt-2 p-3 rounded-xl bg-slate-900/80 border-r-4 border-amber-400 text-xs text-stone-300">
                        <span className="font-bold text-amber-300 block mb-0.5">
                          الشرح والتبرير القانوني ({q.articleRef}):
                        </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!quizSubmitted && (
              <div className="flex justify-end pt-3">
                <button
                  onClick={handleQuizSubmit}
                  disabled={Object.keys(quizAnswers).length === 0}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-sm shadow-lg disabled:opacity-40 transition"
                >
                  تصحيح الإجابات
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Union Cadre Simulation & Loyalty Assessment (Synced with Google Sheets) */}
        {activeTab === 'simulation' && (
          <UnionCadreSimulation isDarkMode={isDarkMode} />
        )}
      </main>

      {/* Share Modal Dialog */}
      {showShareModal && (
        <div
          onClick={() => setShowShareModal(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm p-4 flex items-center justify-center animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl max-w-lg w-full p-5 sm:p-6 flex flex-col gap-5 shadow-2xl relative"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-amber-400" />
                <h3 className="text-base sm:text-lg font-bold font-display text-amber-300">
                  مشاركة الصفحة {currentPage.pageNumber}: {currentPage.chapterTitle}
                </h3>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-stone-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            {/* Content Preview */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 text-xs flex flex-col gap-2">
              <div className="flex items-center justify-between text-stone-400">
                <span className="font-semibold text-emerald-400">السؤال:</span>
                <span>{currentPage.articlesRange}</span>
              </div>
              <p className="text-stone-200 font-medium line-clamp-2">
                &quot;{currentPage.mainQuestion}&quot;
              </p>
              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-amber-300/90 line-clamp-2">
                الخلاصة: {currentPage.keyTakeaway}
              </div>
            </div>

            {/* Quick Copy Portal Link Row */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${isDarkMode ? 'text-amber-300' : 'text-emerald-900'}`}>
                  رابط البوابة الرقمية للنقابة (SNTE):
                </span>
                <span className="text-[10px] text-emerald-500 font-semibold">المعتمدة رسمياً</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={SNTE_PORTAL_URL}
                  className={`flex-1 border rounded-xl px-3 py-2 text-xs font-mono select-all focus:outline-none ${
                    isDarkMode
                      ? 'bg-slate-950 border-slate-700 text-emerald-300'
                      : 'bg-stone-100 border-stone-300 text-emerald-800'
                  }`}
                />
                <button
                  onClick={handleCopyLink}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                    copiedLink
                      ? 'bg-emerald-600 text-white'
                      : 'bg-red-600 hover:bg-red-500 text-white shadow-sm'
                  }`}
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'تم النسخ!' : 'نسخ رابط البوابة'}</span>
                </button>
              </div>
            </div>

            {/* Social Share Buttons Grid */}
            <div className="flex flex-col gap-2">
              <span className={`text-xs font-bold ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                المشاركة المباشرة عبر المنصات مع رابط البوابة:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* WhatsApp */}
                <button
                  onClick={shareToWhatsApp}
                  className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] text-xs font-bold transition shadow-sm"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>واتساب</span>
                </button>

                {/* Telegram */}
                <button
                  onClick={shareToTelegram}
                  className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-[#0088cc]/15 hover:bg-[#0088cc]/25 border border-[#0088cc]/40 text-[#38bdf8] text-xs font-bold transition shadow-sm"
                >
                  <Send className="w-5 h-5" />
                  <span>تيليغرام</span>
                </button>

                {/* Facebook */}
                <button
                  onClick={shareToFacebook}
                  className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-[#1877F2]/15 hover:bg-[#1877F2]/25 border border-[#1877F2]/40 text-[#60a5fa] text-xs font-bold transition shadow-sm"
                >
                  <Globe className="w-5 h-5" />
                  <span>فيسبوك</span>
                </button>

                {/* X / Twitter */}
                <button
                  onClick={shareToTwitter}
                  className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-stone-700/30 hover:bg-stone-700/50 border border-stone-600/40 text-stone-200 text-xs font-bold transition shadow-sm"
                >
                  <span className="font-bold text-sm">𝕏</span>
                  <span>تويتر</span>
                </button>
              </div>
            </div>

            {/* Full text copy button */}
            <button
              onClick={handleCopyFullContent}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-bold transition ${
                copiedContent
                  ? 'bg-emerald-900 border-emerald-500 text-emerald-100'
                  : isDarkMode
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-stone-200'
                  : 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-800'
              }`}
            >
              {copiedContent ? <Check className="w-4 h-4 text-emerald-400" /> : <FileText className="w-4 h-4 text-red-500" />}
              <span>
                {copiedContent
                  ? 'تم نسخ السؤال والجواب ورابط البوابة كاملاً!'
                  : 'نسخ نص السؤال والجواب كاملاً مع رابط البوابة للمنشورات'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Lightbox / Modal for Original Posters */}
      {showImageModal && (
        <div
          onClick={() => setShowImageModal(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm p-4 flex items-center justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`border rounded-3xl max-w-2xl w-full p-4 flex flex-col gap-3 shadow-2xl ${
              isDarkMode ? 'bg-slate-900 border-emerald-500/40' : 'bg-white border-stone-300'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-700">
              <h3 className={`text-sm font-bold ${isDarkMode ? 'text-amber-300' : 'text-emerald-900'}`}>
                الملصق المرجعي للدليل النقابي (مخرجات بوسعادة 2026)
              </h3>
              <button
                onClick={() => setShowImageModal(null)}
                className="text-stone-400 hover:text-white text-xs px-2.5 py-1 rounded bg-slate-800"
              >
                إغلاق ✕
              </button>
            </div>
            <div className="max-h-[80vh] overflow-auto rounded-xl">
              <img
                src={showImageModal}
                alt="الملصق المرجعي"
                className="w-full h-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer with Algerian Tricolor Accent */}
      <footer
        className={`mt-auto border-t py-4 px-6 text-center text-xs flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors ${
          isDarkMode
            ? 'border-emerald-500/30 bg-slate-950 text-stone-400'
            : 'border-emerald-700/20 bg-white text-stone-600 shadow-inner'
        }`}
      >
        <div className="flex items-center gap-2">
          <SnteLogoEmblem size={24} />
          <span className="font-semibold">
            النقابة الوطنية لعمال التربية SNTE · معتمدة تحت رقم: 2000/13/76
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={SNTE_PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 hover:text-emerald-700 font-bold underline"
          >
            البوابة الرقمية: sntedz2026
          </a>
          <span>·</span>
          <span>مخرجات مؤتمر بوسعادة جوان 2026 ومطابقة للقانون 23/02</span>
        </div>
      </footer>
    </div>
  );
}
