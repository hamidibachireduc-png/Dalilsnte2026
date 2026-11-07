import React from 'react';
import {
  Crown,
  Scale,
  CheckCircle2,
  Users,
  Coins,
  Network,
  BookOpen,
  ShieldCheck,
  Gavel,
  Building2,
  Award,
  Globe,
  FileText,
  Vote
} from 'lucide-react';
import { AnswerCardItem } from '../data/snteBookData';

export const SnteLogoEmblem: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 84
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 140 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="شعار النقابة الوطنية لعمال التربية SNTE"
    >
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#926F16" />
        </linearGradient>
        <linearGradient id="greenRing" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#15803D" />
          <stop offset="100%" stopColor="#064E3B" />
        </linearGradient>
        <linearGradient id="redRing" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#991B1B" />
        </linearGradient>
      </defs>

      {/* Outer gold laurel / frame */}
      <circle cx="70" cy="74" r="56" fill="#0A192F" stroke="url(#goldGrad)" strokeWidth="4" />

      {/* Top Half Green Arch */}
      <path
        d="M 18 74 A 52 52 0 0 1 122 74 L 106 74 A 36 36 0 0 0 34 74 Z"
        fill="url(#greenRing)"
        stroke="url(#goldGrad)"
        strokeWidth="1.5"
      />

      {/* Bottom Half Red Arch */}
      <path
        d="M 18 74 A 52 52 0 0 0 122 74 L 106 74 A 36 36 0 0 1 34 74 Z"
        fill="url(#redRing)"
        stroke="url(#goldGrad)"
        strokeWidth="1.5"
      />

      {/* Inner White/Cream Core with Algeria Map silhouette & Crescent */}
      <circle cx="70" cy="74" r="35" fill="#F8FAFC" stroke="url(#goldGrad)" strokeWidth="2.5" />

      {/* Subtle Green/White split inside core */}
      <path d="M 70 39 A 35 35 0 0 1 70 109 Z" fill="#16A34A" fillOpacity="0.22" />

      {/* Crossed Compass / Pen / Olive motif */}
      <circle cx="70" cy="74" r="14" stroke="#DC2626" strokeWidth="3.5" fill="none" />
      <polygon
        points="70,65 72.5,71 79,71 73.8,75 75.8,81 70,77 64.2,81 66.2,75 61,71 67.5,71"
        fill="#DC2626"
      />

      {/* Four Pillar Badges inside emblem: كرامة / وحدة / ترقية / عمل */}
      <rect x="56" y="42" width="28" height="11" rx="5.5" fill="#064E3B" stroke="url(#goldGrad)" strokeWidth="1.2" />
      <text x="70" y="50" textAnchor="middle" fill="#FEF3C7" fontSize="6.5" fontWeight="bold" fontFamily="Cairo, sans-serif">
        كرامة
      </text>

      <rect x="56" y="95" width="28" height="11" rx="5.5" fill="#064E3B" stroke="url(#goldGrad)" strokeWidth="1.2" />
      <text x="70" y="103" textAnchor="middle" fill="#FEF3C7" fontSize="6.5" fontWeight="bold" fontFamily="Cairo, sans-serif">
        عمل
      </text>

      <rect x="33" y="68" width="24" height="11" rx="5.5" fill="#7F1D1D" stroke="url(#goldGrad)" strokeWidth="1.2" />
      <text x="45" y="76" textAnchor="middle" fill="#FEF3C7" fontSize="6" fontWeight="bold" fontFamily="Cairo, sans-serif">
        وحدة
      </text>

      <rect x="83" y="68" width="24" height="11" rx="5.5" fill="#064E3B" stroke="url(#goldGrad)" strokeWidth="1.2" />
      <text x="95" y="76" textAnchor="middle" fill="#FEF3C7" fontSize="6" fontWeight="bold" fontFamily="Cairo, sans-serif">
        ترقية
      </text>

      {/* Top Torch of Knowledge */}
      <path d="M 65 22 L 75 22 L 72 34 L 68 34 Z" fill="url(#goldGrad)" />
      <path
        d="M 70 4 C 62 11, 63 18, 70 22 C 77 18, 78 11, 70 4 Z"
        fill="#F59E0B"
        stroke="#FEF08A"
        strokeWidth="1"
      />
      <path
        d="M 70 9 C 66 13, 67 18, 70 21 C 73 18, 74 13, 70 9 Z"
        fill="#EF4444"
      />

      {/* Texts on Rings */}
      <text x="70" y="31" textAnchor="middle" fill="#FEF3C7" fontSize="7.2" fontWeight="800" fontFamily="Cairo, sans-serif">
        النقابة الوطنية لعمال التربية
      </text>
      <text x="70" y="121" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="800" letterSpacing="1.5">
        S.N.T.E 2026
      </text>
    </svg>
  );
};

export const QuestionerCharacter: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative select-none ${className}`}>
      <svg
        viewBox="0 0 200 220"
        className="w-full h-full drop-shadow-xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="circleBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#15803D" />
            <stop offset="100%" stopColor="#065F46" />
          </linearGradient>
          <linearGradient id="shirtBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>

        {/* Green Circle Backdrop like in image_9f17daeb.png */}
        <circle cx="105" cy="125" r="72" fill="url(#circleBg)" stroke="#D4AF37" strokeWidth="3" />

        {/* Question marks floating */}
        <text x="38" y="65" fill="#FBBF24" fontSize="30" fontWeight="900" fontFamily="Cairo, sans-serif">
          ؟
        </text>
        <text x="158" y="55" fill="#FDE68A" fontSize="24" fontWeight="800" fontFamily="Cairo, sans-serif">
          ؟
        </text>

        {/* Torso / Blue Shirt */}
        <path
          d="M 55 190 C 55 145, 75 132, 105 132 C 135 132, 155 145, 155 190 Z"
          fill="url(#shirtBlue)"
        />

        {/* Neck */}
        <rect x="93" y="108" width="24" height="28" rx="10" fill="#F1C27D" />

        {/* Head */}
        <rect x="76" y="52" width="58" height="64" rx="26" fill="#FCD39D" />

        {/* Hair */}
        <path
          d="M 74 75 C 72 48, 92 38, 115 42 C 134 45, 140 60, 134 78 C 130 64, 118 58, 98 60 C 84 61, 78 68, 74 75 Z"
          fill="#451A03"
        />

        {/* Eyebrows (raised thoughtfully) */}
        <path d="M 88 74 Q 95 70 101 74" stroke="#451A03" strokeWidth="3" strokeLinecap="round" />
        <path d="M 111 72 Q 118 67 124 72" stroke="#451A03" strokeWidth="3" strokeLinecap="round" />

        {/* Eyes */}
        <circle cx="95" cy="82" r="3.2" fill="#1E293B" />
        <circle cx="117" cy="82" r="3.2" fill="#1E293B" />

        {/* Thoughtful Mouth */}
        <path d="M 100 100 Q 107 97 113 101" stroke="#7C2D12" strokeWidth="2.8" strokeLinecap="round" />

        {/* Crossed Arm & Thinking Hand on Chin */}
        <path
          d="M 62 178 C 72 168, 115 168, 136 175"
          stroke="#F1C27D"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <path
          d="M 122 172 L 108 116"
          stroke="#FCD39D"
          strokeWidth="15"
          strokeLinecap="round"
        />
        {/* Hand on chin */}
        <circle cx="106" cy="112" r="9" fill="#FCD39D" />
      </svg>
    </div>
  );
};

export const UnionistCharacter: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative select-none flex flex-col items-center ${className}`}>
      <svg
        viewBox="0 0 240 430"
        className="w-full h-full drop-shadow-2xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="suitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="50%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="lapelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient id="goldTiePin" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>
        </defs>

        {/* Subtle Algerian Green & Gold Aura Arch behind the Unionist */}
        <path
          d="M 40 410 L 210 410 L 210 150 C 210 110, 140 110, 110 150 Z"
          fill="#065F46"
          fillOpacity="0.28"
          stroke="#D4AF37"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* Formal Suit Trousers */}
        <path d="M 92 265 L 118 265 L 115 395 L 94 395 Z" fill="#090D16" />
        <path d="M 122 265 L 148 265 L 145 395 L 124 395 Z" fill="#0F172A" />

        {/* Polished Dress Shoes */}
        <ellipse cx="100" cy="402" rx="18" ry="8" fill="#020617" stroke="#334155" strokeWidth="1" />
        <ellipse cx="138" cy="402" rx="18" ry="8" fill="#020617" stroke="#334155" strokeWidth="1" />

        {/* Right Arm Gesturing Toward the Answer Cards (Pointing Right/Inward in RTL) */}
        <path
          d="M 85 150 L 38 192 L 22 174"
          stroke="url(#suitGrad)"
          strokeWidth="26"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* White Shirt Cuff */}
        <rect x="13" y="160" width="10" height="18" rx="2" transform="rotate(-35 13 160)" fill="#F8FAFC" />
        {/* Gesturing Open Hand */}
        <path
          d="M 16 165 C 4 156, 2 148, 12 145 C 20 143, 26 152, 24 162 Z"
          fill="#F1C27D"
        />

        {/* Suit Jacket Body */}
        <path
          d="M 74 134 C 74 124, 166 124, 166 134 L 158 272 L 82 272 Z"
          fill="url(#suitGrad)"
          stroke="#334155"
          strokeWidth="1"
        />

        {/* White Dress Shirt V-Zone */}
        <polygon points="102,126 138,126 120,196" fill="#FFFFFF" />

        {/* Executive Dark Tie */}
        <polygon points="116,132 124,132 127,188 120,198 113,188" fill="#020617" />
        {/* Gold Tie Clip */}
        <rect x="114" y="162" width="12" height="2.5" fill="url(#goldTiePin)" />

        {/* Suit Lapels */}
        <polygon points="102,126 86,148 120,198" fill="url(#lapelGrad)" />
        <polygon points="138,126 154,148 120,198" fill="url(#lapelGrad)" />

        {/* SNTE Pin on Lapel */}
        <circle cx="142" cy="156" r="4" fill="#D4AF37" />
        <circle cx="142" cy="156" r="2.2" fill="#15803D" />

        {/* Left Arm casually in pocket */}
        <path
          d="M 162 142 C 180 175, 176 212, 154 242"
          stroke="url(#suitGrad)"
          strokeWidth="24"
          strokeLinecap="round"
        />
      </svg>

      {/* The Head IS the Official SNTE Emblem (matching both reference images!) */}
      <div className="absolute top-[2%] left-1/2 -translate-x-1/2 w-[46%]">
        <SnteLogoEmblem className="w-full h-auto drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]" size={115} />
      </div>
    </div>
  );
};

export const CardIconGlyph: React.FC<{ iconType: AnswerCardItem['iconType']; className?: string }> = ({
  iconType,
  className = 'w-6 h-6'
}) => {
  switch (iconType) {
    case 'crown':
      return <Crown className={className} />;
    case 'scale':
      return <Scale className={className} />;
    case 'check':
      return <CheckCircle2 className={className} />;
    case 'users':
      return <Users className={className} />;
    case 'coins':
      return <Coins className={className} />;
    case 'sitemap':
      return <Network className={className} />;
    case 'book':
      return <BookOpen className={className} />;
    case 'shield':
      return <ShieldCheck className={className} />;
    case 'gavel':
      return <Gavel className={className} />;
    case 'building':
      return <Building2 className={className} />;
    case 'award':
      return <Award className={className} />;
    case 'globe':
      return <Globe className={className} />;
    case 'file':
      return <FileText className={className} />;
    case 'vote':
      return <Vote className={className} />;
    default:
      return <CheckCircle2 className={className} />;
  }
};

export const OrnamentalPlaqueCard: React.FC<{
  card: AnswerCardItem;
  index: number;
  isSelected?: boolean;
  onClick?: () => void;
  isLightMode?: boolean;
}> = ({ card, index, isSelected, onClick, isLightMode = false }) => {
  // Rich Algerian colors: Emerald Green, Pure Ruby Red, White, Deep Slate/Green
  const darkBannerStyles = [
    'from-[#053725] via-[#0b5b3f] to-[#041c2c]', // Emerald to deep
    'from-[#5c0e17] via-[#851824] to-[#053725]', // Algerian Red to Green
    'from-[#0b5b3f] via-[#063f2b] to-[#450a11]', // Green to Red
    'from-[#0a3052] via-[#053725] to-[#5c0e17]'  // Navy/Green/Red
  ];

  const lightBannerStyles = [
    'from-white via-[#f0fdf4] to-[#ecfdf5] border-emerald-600/40 shadow-sm text-stone-900', // Green tint on white
    'from-white via-[#fef2f2] to-[#fff1f2] border-red-600/40 shadow-sm text-stone-900',    // Red tint on white
    'from-white via-[#f0fdf4] to-[#fef2f2] border-amber-600/40 shadow-sm text-stone-900',  // Green & Red accents
    'from-white via-[#f8fafc] to-[#f0fdf4] border-emerald-600/40 shadow-sm text-stone-900'  // Crisp white with green border
  ];

  const gradientClass = isLightMode
    ? lightBannerStyles[index % lightBannerStyles.length]
    : darkBannerStyles[index % darkBannerStyles.length];

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`group relative flex items-stretch rounded-2xl border-2 transition-all duration-150 overflow-hidden cursor-pointer ${
        isSelected
          ? 'border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.3)] scale-[1.01]'
          : isLightMode
          ? 'border-emerald-700/30 hover:border-emerald-600 shadow-md'
          : 'border-[#D4AF37]/80 hover:border-amber-300 shadow-lg'
      } bg-gradient-to-l ${gradientClass}`}
    >
      {/* Right Badge Section: In Algerian Green/Gold/Red styling */}
      <div
        className={`w-16 sm:w-20 shrink-0 flex flex-col items-center justify-center p-2 border-l-2 relative ${
          index % 2 === 0
            ? 'bg-gradient-to-b from-[#15803d] via-[#166534] to-[#14532d] text-white border-emerald-400/50'
            : 'bg-gradient-to-b from-[#b91c1c] via-[#991b1b] to-[#7f1d1d] text-white border-red-400/50'
        }`}
      >
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/40">
          <CardIconGlyph iconType={card.iconType} className="w-6 h-6 text-white stroke-[2.2]" />
        </div>
        <span className="mt-1 text-[11px] font-extrabold text-amber-200 tabular-nums">
          0{index + 1}
        </span>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-3.5 sm:p-4 text-right flex flex-col justify-center">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3
            className={`text-base sm:text-lg font-extrabold leading-snug ${
              isLightMode
                ? index % 2 === 0 ? 'text-emerald-850 text-emerald-900 group-hover:text-emerald-700' : 'text-red-900 group-hover:text-red-700'
                : 'text-amber-200 group-hover:text-amber-100'
            }`}
          >
            {card.title}
          </h3>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              isLightMode
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'text-emerald-200/90 bg-emerald-950/60 border border-emerald-500/30'
            }`}
          >
            {card.articleRef}
          </span>
        </div>

        {card.subtitle && (
          <p
            className={`text-xs sm:text-sm font-semibold mt-0.5 ${
              isLightMode ? 'text-stone-700 font-bold' : 'text-white/95'
            }`}
          >
            {card.subtitle}
          </p>
        )}

        <p
          className={`text-xs sm:text-sm mt-1.5 leading-relaxed ${
            isLightMode ? 'text-stone-700' : 'text-stone-200/90'
          }`}
        >
          {card.description}
        </p>
      </div>
    </div>
  );
};
