// Crop image components — uses real Unsplash photos with rich SVG fallbacks.
// When the user runs the app locally with internet, Unsplash photos load.
// If any fails, the inline SVG illustration is shown so the UI is never broken.

import { useState } from "react";

// Local crop image references from public/crops folder
export const CROP_PHOTOS = {
  Wheat: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80&auto=format&fit=crop",
  Rice: "/crops/download.jpg",
  Maize: "/crops/download%20(1).jpg",
  Cotton: "/crops/Texas%20Cotton%20Bolls.jpg",
  Sugarcane: "/crops/Summer%20Love%21.jpg",
  Soybean: "/crops/Soybean%20or%20soya%20bean%20plantation.jpg",
};

export const CROP_DESCRIPTIONS = {
  Wheat: "India's second-largest cereal. Rabi staple powering Punjab, Haryana, Uttar Pradesh.",
  Rice: "Kharif backbone of the food economy. West Bengal, Punjab, and Telangana lead by tonnage.",
  Maize: "Versatile coarse cereal feeding poultry, starch, and ethanol. Bihar and Karnataka dominate.",
  Cotton: "Cash fiber crop driving textile exports. Gujarat and Maharashtra are the heartland.",
  Sugarcane: "Long-cycle high-revenue crop. UP and Maharashtra together produce over 60% of national output.",
  Soybean: "Oilseed of the Malwa plateau. Madhya Pradesh and Maharashtra grow nearly all of it.",
};

// Rich SVG illustrations — fallback when photos can't load
function WheatSvg() {
  return (
    <svg viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="wheat-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FCE38A" />
          <stop offset="1" stopColor="#F38181" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="wheat-field" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E8B547" />
          <stop offset="1" stopColor="#C2912E" />
        </linearGradient>
        <linearGradient id="wheat-stem" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F9D976" />
          <stop offset="1" stopColor="#A8740D" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="url(#wheat-sky)" />
      <ellipse cx="320" cy="50" rx="36" ry="36" fill="#FFE9A8" opacity="0.85" />
      {/* horizon */}
      <path d="M0 160 Q120 145 220 152 T400 158 V250 H0 Z" fill="url(#wheat-field)" />
      <path d="M0 195 Q90 180 200 188 T400 192 V250 H0 Z" fill="#A8740D" opacity="0.55" />
      {/* wheat stalks */}
      {[40, 100, 160, 220, 280, 340].map((x, i) => (
        <g key={i} transform={`translate(${x},${130 - (i % 3) * 8})`}>
          <line x1="0" y1="0" x2="0" y2="80" stroke="url(#wheat-stem)" strokeWidth="2.2" />
          {[0, 10, 20, 30, 40].map((dy) => (
            <g key={dy}>
              <ellipse cx="-5" cy={dy} rx="3.2" ry="6" fill="#D4A24A" />
              <ellipse cx="5" cy={dy + 3} rx="3.2" ry="6" fill="#E8B547" />
            </g>
          ))}
          <line x1="0" y1="-12" x2="-3" y2="-30" stroke="#B98B22" strokeWidth="1" />
          <line x1="0" y1="-12" x2="0" y2="-32" stroke="#B98B22" strokeWidth="1" />
          <line x1="0" y1="-12" x2="3" y2="-30" stroke="#B98B22" strokeWidth="1" />
        </g>
      ))}
    </svg>
  );
}

function RiceSvg() {
  return (
    <svg viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="rice-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#A7D8DE" />
          <stop offset="1" stopColor="#E4F1E8" />
        </linearGradient>
        <linearGradient id="rice-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#86C5C8" />
          <stop offset="1" stopColor="#3F8A75" />
        </linearGradient>
        <linearGradient id="rice-blade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#A5D870" />
          <stop offset="1" stopColor="#2E7D32" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="url(#rice-sky)" />
      <ellipse cx="80" cy="55" rx="22" ry="22" fill="#FFFFFF" opacity="0.65" />
      <ellipse cx="100" cy="55" rx="28" ry="22" fill="#FFFFFF" opacity="0.55" />
      {/* mountains */}
      <path d="M0 140 L70 100 L130 130 L200 90 L260 125 L330 100 L400 135 V160 H0 Z" fill="#7BA88F" opacity="0.55" />
      {/* paddy water terraces */}
      <path d="M0 160 Q200 150 400 162 V190 H0 Z" fill="url(#rice-water)" />
      <path d="M0 190 Q200 180 400 192 V215 H0 Z" fill="url(#rice-water)" opacity="0.85" />
      <path d="M0 215 Q200 205 400 220 V250 H0 Z" fill="url(#rice-water)" opacity="0.7" />
      {/* rice plants */}
      {[30, 80, 130, 180, 230, 280, 330, 380].map((x, i) => (
        <g key={i} transform={`translate(${x},${158 - (i % 2) * 5})`}>
          {[-8, 0, 8].map((dx) => (
            <path
              key={dx}
              d={`M${dx} 0 Q${dx - 4} -14 ${dx} -24`}
              stroke="url(#rice-blade)"
              strokeWidth="1.6"
              fill="none"
              strokeLinecap="round"
            />
          ))}
        </g>
      ))}
    </svg>
  );
}

function MaizeSvg() {
  return (
    <svg viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="maize-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFEFC6" />
          <stop offset="1" stopColor="#A1C45A" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="cob-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE066" />
          <stop offset="1" stopColor="#E5A52B" />
        </linearGradient>
        <linearGradient id="husk-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B7D480" />
          <stop offset="1" stopColor="#4F7A2E" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="url(#maize-sky)" />
      {/* field rows */}
      <path d="M0 200 L400 200 L400 250 L0 250 Z" fill="#6B8E3D" />
      {/* corn cobs - large center */}
      <g transform="translate(200,140)">
        {/* husk leaves */}
        <path d="M-30 -10 Q-50 -30 -40 -70 Q-20 -50 -15 -10 Z" fill="url(#husk-grad)" />
        <path d="M30 -10 Q50 -30 40 -70 Q20 -50 15 -10 Z" fill="url(#husk-grad)" />
        {/* cob */}
        <ellipse cx="0" cy="0" rx="22" ry="48" fill="url(#cob-grad)" />
        {/* kernels */}
        {[-36, -24, -12, 0, 12, 24, 36].map((y) =>
          [-14, -7, 0, 7, 14].map((x) => (
            <circle key={`${y}-${x}`} cx={x} cy={y} r="3.4" fill="#FFD142" stroke="#B8841F" strokeWidth="0.6" />
          ))
        )}
        {/* silk */}
        <path d="M-8 -48 Q-2 -68 4 -54" stroke="#E8C067" strokeWidth="1.4" fill="none" />
        <path d="M0 -48 Q4 -66 -2 -52" stroke="#D9B14F" strokeWidth="1.4" fill="none" />
        <path d="M8 -48 Q14 -66 6 -50" stroke="#E8C067" strokeWidth="1.4" fill="none" />
      </g>
      {/* side cobs */}
      <g transform="translate(70,180) scale(0.55) rotate(-12)">
        <ellipse cx="0" cy="0" rx="20" ry="44" fill="url(#cob-grad)" />
        <path d="M-26 -10 Q-44 -30 -34 -64 Q-16 -46 -12 -10 Z" fill="url(#husk-grad)" />
      </g>
      <g transform="translate(330,180) scale(0.55) rotate(15)">
        <ellipse cx="0" cy="0" rx="20" ry="44" fill="url(#cob-grad)" />
        <path d="M26 -10 Q44 -30 34 -64 Q16 -46 12 -10 Z" fill="url(#husk-grad)" />
      </g>
    </svg>
  );
}

function CottonSvg() {
  return (
    <svg viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="cotton-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D4E5F4" />
          <stop offset="1" stopColor="#A8C09E" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="url(#cotton-sky)" />
      {/* horizon ground */}
      <path d="M0 170 Q200 160 400 168 V250 H0 Z" fill="#7D8F65" />
      <path d="M0 195 Q200 185 400 192 V250 H0 Z" fill="#5C6E47" opacity="0.7" />
      {/* cotton plant stems */}
      {[60, 150, 250, 340].map((x, i) => (
        <g key={i} transform={`translate(${x},${165 - (i % 2) * 6})`}>
          {/* stem */}
          <path d="M0 80 Q-4 40 0 0" stroke="#4F5D3A" strokeWidth="2" fill="none" />
          {/* leaves */}
          <path d="M0 40 Q-22 30 -20 50 Q-8 48 0 42" fill="#5C7340" />
          <path d="M0 25 Q18 18 22 38 Q10 36 2 28" fill="#5C7340" />
          {/* cotton bolls */}
          <g transform="translate(0,-5)">
            <circle cx="-6" cy="0" r="9" fill="#FFFFFF" />
            <circle cx="6" cy="-2" r="10" fill="#FFFFFF" />
            <circle cx="0" cy="-10" r="9" fill="#FFFFFF" />
            <circle cx="-3" cy="-3" r="7" fill="#F2F0E8" />
            <circle cx="4" cy="2" r="6" fill="#F8F6EE" />
            {/* sepals */}
            <path d="M-8 6 L-12 14 L-4 10 Z" fill="#7A5C3E" />
            <path d="M8 6 L12 14 L4 10 Z" fill="#7A5C3E" />
          </g>
        </g>
      ))}
    </svg>
  );
}

function SugarcaneSvg() {
  return (
    <svg viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="sc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C7E1B8" />
          <stop offset="1" stopColor="#74A658" />
        </linearGradient>
        <linearGradient id="sc-cane" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9CBF6F" />
          <stop offset="1" stopColor="#4F7825" />
        </linearGradient>
        <linearGradient id="sc-leaf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B5E37A" />
          <stop offset="1" stopColor="#2E6B17" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="url(#sc-sky)" />
      {/* sugarcane stalks */}
      {[
        { x: 40, h: 200, w: 12 },
        { x: 80, h: 220, w: 14 },
        { x: 130, h: 235, w: 15 },
        { x: 180, h: 215, w: 13 },
        { x: 230, h: 230, w: 14 },
        { x: 280, h: 200, w: 12 },
        { x: 330, h: 225, w: 14 },
        { x: 370, h: 210, w: 13 },
      ].map((stalk, i) => (
        <g key={i} transform={`translate(${stalk.x},${250 - stalk.h})`}>
          {/* cane */}
          <rect x={-stalk.w / 2} y="0" width={stalk.w} height={stalk.h} fill="url(#sc-cane)" rx="3" />
          {/* segments */}
          {[20, 50, 80, 110, 140, 170, 200].filter((y) => y < stalk.h).map((y) => (
            <line key={y} x1={-stalk.w / 2} y1={y} x2={stalk.w / 2} y2={y} stroke="#2F4A14" strokeWidth="1" />
          ))}
          {/* leaves at top */}
          <path
            d={`M0 0 Q${-stalk.w * 1.5} -${stalk.w * 3} -${stalk.w * 0.5} -${stalk.w * 4}`}
            stroke="url(#sc-leaf)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={`M0 0 Q${stalk.w * 1.5} -${stalk.w * 3} ${stalk.w * 0.5} -${stalk.w * 4}`}
            stroke="url(#sc-leaf)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={`M0 0 Q0 -${stalk.w * 2.5} ${stalk.w * 0.2} -${stalk.w * 5}`}
            stroke="url(#sc-leaf)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      ))}
    </svg>
  );
}

function SoybeanSvg() {
  return (
    <svg viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="sb-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F7F0C8" />
          <stop offset="1" stopColor="#C9D88C" />
        </linearGradient>
        <linearGradient id="sb-pod" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C7AE5A" />
          <stop offset="1" stopColor="#8A6E1F" />
        </linearGradient>
        <linearGradient id="sb-leaf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#94B850" />
          <stop offset="1" stopColor="#436720" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="url(#sb-sky)" />
      <path d="M0 175 Q200 165 400 175 V250 H0 Z" fill="#6E7A3B" />
      {/* plants */}
      {[80, 200, 320].map((x, i) => (
        <g key={i} transform={`translate(${x},${170})`}>
          {/* stem */}
          <path d="M0 60 Q4 30 -2 0" stroke="#5B6E2C" strokeWidth="2.4" fill="none" />
          {/* trefoil leaves */}
          <ellipse cx="-22" cy="-10" rx="14" ry="9" fill="url(#sb-leaf)" transform="rotate(-30 -22 -10)" />
          <ellipse cx="22" cy="-10" rx="14" ry="9" fill="url(#sb-leaf)" transform="rotate(30 22 -10)" />
          <ellipse cx="0" cy="-22" rx="14" ry="9" fill="url(#sb-leaf)" />
          <ellipse cx="-26" cy="20" rx="14" ry="9" fill="url(#sb-leaf)" transform="rotate(-30 -26 20)" />
          <ellipse cx="26" cy="20" rx="14" ry="9" fill="url(#sb-leaf)" transform="rotate(30 26 20)" />
          {/* pods */}
          <g transform="translate(-8, 30) rotate(-12)">
            <ellipse cx="0" cy="0" rx="14" ry="4.2" fill="url(#sb-pod)" />
            <circle cx="-7" cy="0" r="2.6" fill="#7A5C16" />
            <circle cx="0" cy="0" r="2.6" fill="#7A5C16" />
            <circle cx="7" cy="0" r="2.6" fill="#7A5C16" />
          </g>
          <g transform="translate(10, 40) rotate(8)">
            <ellipse cx="0" cy="0" rx="14" ry="4.2" fill="url(#sb-pod)" />
            <circle cx="-7" cy="0" r="2.6" fill="#7A5C16" />
            <circle cx="0" cy="0" r="2.6" fill="#7A5C16" />
            <circle cx="7" cy="0" r="2.6" fill="#7A5C16" />
          </g>
        </g>
      ))}
    </svg>
  );
}

const SVG_MAP = {
  Wheat: WheatSvg,
  Rice: RiceSvg,
  Maize: MaizeSvg,
  Cotton: CottonSvg,
  Sugarcane: SugarcaneSvg,
  Soybean: SoybeanSvg,
};

/**
 * CropImage — tries the real photo first, falls back to SVG illustration on error.
 */
export function CropImage({ crop, alt }) {
  const [failed, setFailed] = useState(false);
  const SvgFallback = SVG_MAP[crop] || WheatSvg;
  const url = CROP_PHOTOS[crop];

  if (failed || !url) {
    return <SvgFallback />;
  }
  return (
    <img
      src={url}
      alt={alt || crop}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export const ALL_CROPS = ["Wheat", "Rice", "Maize", "Cotton", "Sugarcane", "Soybean"];
