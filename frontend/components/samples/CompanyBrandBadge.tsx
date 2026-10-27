import React from 'react';

interface CompanyBrandBadgeProps {
  companyKey: string;
  companyName: string;
  className?: string;
}

export function CompanyBrandBadge({ companyKey, companyName, className = '' }: CompanyBrandBadgeProps) {
  const key = companyKey.toLowerCase();

  switch (key) {
    case 'technova':
      return (
        <span className={`inline-flex items-center font-bold tracking-tight text-base font-sans ${className}`}>
          <span className="text-[#285FEA] font-extrabold">Tech</span>
          <span className="text-zinc-900 dark:text-zinc-100 font-bold">Nova</span>
        </span>
      );

    case 'chime':
      return (
        <span className={`inline-flex items-center font-bold tracking-tight text-[#25C974] text-lg font-sans ${className}`}>
          chime<span className="text-[#25C974] text-xs align-super ml-0.5">•</span>
        </span>
      );

    case 'disney':
      return (
        <span className={`inline-flex items-center font-serif italic font-extrabold text-zinc-900 dark:text-zinc-100 text-lg tracking-wide ${className}`}>
          Disney
        </span>
      );

    case 'adidas':
      return (
        <span className={`inline-flex items-center gap-1.5 ${className}`}>
          {/* Adidas 3 angled bars */}
          <svg className="w-5 h-4 text-zinc-900 dark:text-white fill-current shrink-0" viewBox="0 0 32 24">
            <rect x="2" y="16" width="5" height="8" transform="skewX(-24)" />
            <rect x="11" y="8" width="5" height="16" transform="skewX(-24)" />
            <rect x="20" y="0" width="5" height="24" transform="skewX(-24)" />
          </svg>
          <span className="font-extrabold tracking-tighter text-zinc-900 dark:text-white lowercase text-sm">adidas</span>
        </span>
      );

    case 'sony':
      return (
        <span className={`inline-flex items-center font-serif font-black tracking-[0.25em] text-zinc-900 dark:text-white text-base ${className}`}>
          SONY
        </span>
      );

    case 'accenture':
      return (
        <span className={`inline-flex items-center font-bold text-zinc-900 dark:text-white text-base tracking-tight ${className}`}>
          accent<span className="text-[#A100FF] font-black text-lg mx-0.5">&gt;</span>ure
        </span>
      );

    case 'deloitte':
      return (
        <span className={`inline-flex items-center font-bold text-zinc-900 dark:text-white text-base tracking-tight ${className}`}>
          Deloitte<span className="text-[#86BC25] font-black text-xl leading-none">.</span>
        </span>
      );

    case 'ncstate':
      return (
        <span className={`inline-flex items-center gap-1 ${className}`}>
          <span className="bg-[#CC0000] text-white font-black text-[10px] px-1 py-0.5 rounded-sm tracking-wider">
            NC STATE
          </span>
          <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 tracking-wider">UNIVERSITY</span>
        </span>
      );

    case 'meta':
    case 'facebook':
      return (
        <span className={`inline-flex items-center font-bold text-[#1877F2] text-base tracking-tight font-sans ${className}`}>
          facebook
        </span>
      );

    case 'google':
      return (
        <span className={`inline-flex items-center font-semibold text-base tracking-tight font-sans ${className}`}>
          <span className="text-[#4285F4]">G</span>
          <span className="text-[#EA4335]">o</span>
          <span className="text-[#FBBC05]">o</span>
          <span className="text-[#4285F4]">g</span>
          <span className="text-[#34A853]">l</span>
          <span className="text-[#EA4335]">e</span>
        </span>
      );

    case 'apple':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium text-zinc-900 dark:text-white text-base tracking-tight ${className}`}>
          <svg className="w-4 h-4 fill-current text-zinc-900 dark:text-white shrink-0" viewBox="0 0 170 170">
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.69-7.85-12-14.42-6-9.15-10.83-19.86-14.51-32.14-3.68-12.27-5.52-23.75-5.52-34.42 0-14.48 3.73-26.65 11.2-36.5 7.47-9.85 16.89-14.86 28.26-15.03 5.47 0 11.45 1.48 17.95 4.45 6.49 2.97 10.45 4.49 11.88 4.56 1.89-.13 6.13-1.68 12.73-4.63 6.6-2.97 12.35-4.33 17.26-4.08 12.98.66 23.44 5.37 31.39 14.15-11.37 6.87-16.94 16.35-16.71 28.45.24 9.61 3.99 17.65 11.26 24.11 7.27 6.46 15.84 10.22 25.71 11.28-2.02 5.99-4.35 11.96-6.99 17.92zM119.22 31.84c0-7.39 2.68-14.28 8.04-20.67 5.36-6.39 11.94-10.45 19.74-12.17 1.01 7.72-1.39 14.84-7.21 21.36-5.82 6.52-12.68 10.32-20.57 11.48z" />
          </svg>
          <span className="font-semibold text-sm">Apple</span>
        </span>
      );

    case 'amazon':
    case 'aws':
      return (
        <span className={`inline-flex items-center gap-1 font-bold text-zinc-900 dark:text-white text-base tracking-tight ${className}`}>
          <span className="tracking-tighter">amazon</span>
          <span className="text-[#FF9900] text-xs font-black tracking-normal px-1 py-0.2 rounded bg-[#FF9900]/20 ml-1">
            AWS
          </span>
        </span>
      );

    case 'microsoft':
      return (
        <span className={`inline-flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-white text-base tracking-tight ${className}`}>
          {/* Microsoft 4 squares */}
          <span className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5 shrink-0">
            <span className="bg-[#F25022] rounded-[1px]" />
            <span className="bg-[#7FBA00] rounded-[1px]" />
            <span className="bg-[#00A4EF] rounded-[1px]" />
            <span className="bg-[#FFB900] rounded-[1px]" />
          </span>
          <span className="text-sm font-semibold">Microsoft</span>
        </span>
      );

    case 'netflix':
      return (
        <span className={`inline-flex items-center font-black tracking-wider text-[#E50914] text-base font-sans ${className}`}>
          NETFLIX
        </span>
      );

    case 'tesla':
      return (
        <span className={`inline-flex items-center font-sans font-bold tracking-[0.25em] text-[#E82127] text-base ${className}`}>
          TESLA
        </span>
      );

    case 'nvidia':
      return (
        <span className={`inline-flex items-center gap-1.5 font-black text-zinc-900 dark:text-white text-sm tracking-tight ${className}`}>
          <span className="w-2.5 h-2.5 rounded-full bg-[#76B900] shrink-0" />
          <span>NVIDIA</span>
        </span>
      );

    case 'stripe':
      return (
        <span className={`inline-flex items-center font-black text-[#635BFF] text-lg tracking-tight font-sans ${className}`}>
          stripe
        </span>
      );

    case 'uber':
      return (
        <span className={`inline-flex items-center font-sans font-black tracking-widest text-zinc-900 dark:text-white text-base ${className}`}>
          Uber
        </span>
      );

    case 'goldman-sachs':
      return (
        <span className={`inline-flex items-center font-serif font-bold text-[#7399C6] text-sm tracking-wide ${className}`}>
          Goldman Sachs
        </span>
      );

    case 'airbnb':
      return (
        <span className={`inline-flex items-center gap-1 font-bold text-[#FF5A5F] text-base tracking-tight ${className}`}>
          <span>airbnb</span>
        </span>
      );

    case 'spotify':
      return (
        <span className={`inline-flex items-center gap-1.5 font-bold text-[#1ED760] text-base tracking-tight ${className}`}>
          <svg className="w-4 h-4 fill-current text-[#1ED760] shrink-0" viewBox="0 0 24 24">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
          <span className="text-zinc-900 dark:text-white text-sm">Spotify</span>
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center font-bold text-zinc-900 dark:text-white text-base tracking-tight ${className}`}>
          {companyName}
        </span>
      );
  }
}
