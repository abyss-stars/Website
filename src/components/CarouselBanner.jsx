import { useState, useEffect } from 'react';

const slides = [
  {
    title: '官服更新福利',
    subtitle: '更新官服移动端得好礼！',
    copyright: '\u00A9 HYPERGRYPH \u00A9 CAPCOM',
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    accent: (
      <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block">
        <div className="w-40 h-40 rounded-full bg-[#4CAF50]/20 blur-3xl" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="50" stroke="rgba(76,175,80,0.4)" strokeWidth="2" />
            <path d="M60 20v80M20 60h80" stroke="rgba(76,175,80,0.3)" strokeWidth="1" />
            <polygon points="55,40 55,80 85,60" fill="rgba(76,175,80,0.6)" />
          </svg>
        </div>
      </div>
    ),
  },
  {
    title: '明日方舟新活动',
    subtitle: 'SideStory「火山旅梦」限时开启！',
    copyright: '\u00A9 HYPERGRYPH',
    gradient: 'linear-gradient(135deg, #2d1b2e 0%, #3d2040 50%, #1a0a2e 100%)',
    accent: (
      <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block">
        <div className="w-40 h-40 rounded-full bg-purple-500/20 blur-3xl" />
      </div>
    ),
  },
  {
    title: '泡姆泡姆联动',
    subtitle: '全新联动内容即将上线，敬请期待！',
    copyright: '\u00A9 HYPERGRYPH',
    gradient: 'linear-gradient(135deg, #1a2e1a 0%, #204020 50%, #0a2e0a 100%)',
    accent: (
      <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block">
        <div className="w-40 h-40 rounded-full bg-teal-500/20 blur-3xl" />
      </div>
    ),
  },
];

export default function CarouselBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent(prev => (prev + 1) % slides.length), 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[300px] rounded-xl overflow-hidden mb-6">
      {slides.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ background: slide.gradient, opacity: i === current ? 1 : 0 }}
        >
          <div className="absolute inset-0 carousel-overlay" />
          {slide.accent}
          <div className="relative z-10 flex flex-col items-start justify-center h-full px-8 lg:px-12">
            <h2 className="text-white font-bold text-3xl md:text-4xl mb-3">{slide.title}</h2>
            <p className="text-[#CCCCCC] text-base mb-6">{slide.subtitle}</p>
            <p className="text-[#888] text-xs absolute bottom-4 right-8">{slide.copyright}</p>
          </div>
        </div>
      ))}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${i === current ? 'bg-[#4CAF50] w-6' : 'bg-white/50 hover:bg-white/80'}`}
          />
        ))}
      </div>

      <button
        onClick={() => setCurrent(prev => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center hover:bg-black/50 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      <button
        onClick={() => setCurrent(prev => (prev + 1) % slides.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center hover:bg-black/50 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
      </button>
    </div>
  );
}
