import React from 'react';

/**
 * Official Indian Government Emblems in SVG format.
 * Includes:
 *  1. AshokaLionCapital (State Emblem of India with "सत्यमेव जयते")
 *  2. AshokaChakra (24-spoke Dharma Chakra)
 *  3. G20Logo (Official G20 India motif with Lotus, Earth & Vasudhaiva Kutumbakam)
 *  4. DigitalIndiaLogo (Digital India symbol)
 */

export const AshokaLionCapital = ({ className = 'w-10 h-14' }) => (
  <img
    src="/White_Ashoka.png"
    alt="State Emblem of India - Lion Capital of Ashoka"
    className={`object-contain drop-shadow-md ${className}`}
  />
);

export const AshokaChakra = ({ className = 'w-6 h-6', spokeColor = '#000080', ringColor = '#000080' }) => {
  // Generate 24 spokes (every 15 degrees)
  const spokes = Array.from({ length: 24 }, (_, i) => i * 15);

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-label="Ashoka Chakra - 24 Spokes Dharma Chakra"
    >
      {/* Outer Rim */}
      <circle cx="50" cy="50" r="46" fill="none" stroke={ringColor} strokeWidth="4" />
      <circle cx="50" cy="50" r="41" fill="none" stroke={ringColor} strokeWidth="1.5" opacity="0.7" />

      {/* 24 Spokes */}
      <g stroke={spokeColor} strokeWidth="2" strokeLinecap="round">
        {spokes.map((deg) => (
          <line
            key={deg}
            x1="50"
            y1="50"
            x2={50 + 40 * Math.cos((deg * Math.PI) / 180)}
            y2={50 + 40 * Math.sin((deg * Math.PI) / 180)}
          />
        ))}
      </g>

      {/* 24 Triangular Petals on rim */}
      {spokes.map((deg) => {
        const rad = ((deg + 7.5) * Math.PI) / 180;
        const x = 50 + 43.5 * Math.cos(rad);
        const y = 50 + 43.5 * Math.sin(rad);
        return (
          <circle
            key={`dot-${deg}`}
            cx={x}
            cy={y}
            r="1.2"
            fill={spokeColor}
          />
        );
      })}

      {/* Inner Central Hub */}
      <circle cx="50" cy="50" r="9" fill={spokeColor} />
      <circle cx="50" cy="50" r="4" fill="#ffffff" />
    </svg>
  );
};

export const G20Logo = ({ className = 'h-10' }) => (
  <div className={`inline-flex items-center gap-2 select-none ${className}`} title="G20 India 2023-24">
    <img
      src="/g20_logo.png"
      alt="G20 Bharat 2023 India"
      className={`h-full w-auto object-contain ${className}`}
    />
  </div>
);

export const DigitalIndiaLogo = ({ className = 'h-9' }) => (
  <div className={`inline-flex items-center gap-1.5 select-none ${className}`} title="Digital India - Power To Empower">
    <svg viewBox="0 0 120 40" className="h-full w-auto" fill="none">
      {/* Tri-color emblem wings */}
      <path d="M8 8 C14 8 20 14 20 20 C20 26 14 32 8 32 C12 26 12 14 8 8 Z" fill="#FF9933" />
      <path d="M14 12 C18 12 22 16 22 20 C22 24 18 28 14 28 C17 24 17 16 14 12 Z" fill="#ffffff" />
      <path d="M20 16 C23 16 26 18 26 20 C26 22 23 24 20 24 C22 22 22 18 20 16 Z" fill="#138808" />

      {/* Digital India Text */}
      <text x="32" y="18" fill="#ffffff" fontSize="10.5" fontWeight="800" fontFamily="sans-serif">
        Digital India
      </text>
      <text x="32" y="28" fill="#94a3b8" fontSize="5.8" fontWeight="600" letterSpacing="0.6">
        Power To Empower
      </text>
    </svg>
  </div>
);

const GovEmblems = {
  AshokaLionCapital,
  AshokaChakra,
  G20Logo,
  DigitalIndiaLogo,
};

export default GovEmblems;
