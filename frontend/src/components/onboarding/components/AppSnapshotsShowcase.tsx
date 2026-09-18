import React from 'react';
import {
  Play,
  Info,
  SkipBack,
  SkipForward,
  Send,
  Mic,
  Lock,
  Volume2
} from 'lucide-react';

export const AppSnapshotsShowcase: React.FC<{ onExplore?: () => void }> = ({ onExplore }) => {
  return (
    <section className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-8 py-16 space-y-20">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Explore the Interface
        </h2>
        <p className="text-sm sm:text-base font-bold text-white/90">
          A seamless blend of cinema, studio music, and intelligent companion.
        </p>
      </div>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 1. MOVIE SECTION (Left Side, Medium Size)                         */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-center gap-8 lg:gap-12">
        {/* Left Side: Window Snapshot */}
        <div className="w-full md:w-[60%] lg:w-[58%] shrink-0">
          <div className="relative rounded-2xl border border-white/20 bg-[#09070F] shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden transition-all duration-300 hover:border-red-500/50">
            {/* macOS Window Titlebar */}
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#0E0B16] border-b border-white/[0.1] select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
              </div>
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.06] text-[10px] font-mono text-white/80 font-bold">
                <Lock className="w-2.5 h-2.5 text-emerald-400" />
                <span>zhoosh.stream/cinema</span>
              </div>
              <div className="w-8" />
            </div>

            {/* Window Content */}
            <div className="relative bg-[#06040A] p-4 sm:p-5 flex flex-col justify-between min-h-[300px] sm:min-h-[340px]">
              {/* Backdrop */}
              <div className="absolute inset-0 z-0">
                <img
                  src="https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg"
                  alt="Cinema Showcase"
                  className="w-full h-full object-cover opacity-40 filter contrast-125"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#06040A] via-[#06040A]/85 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06040A] via-transparent to-transparent" />
              </div>

              {/* Top Bar Mockup */}
              <div className="relative z-10 flex items-center justify-between text-xs text-white pb-3">
                <span className="font-black text-[#FF1E56] text-xs tracking-wider">ZHOOSH CINEMA</span>
                <div className="flex items-center gap-3 text-[11px] font-bold text-white/90">
                  <span className="text-white font-black underline underline-offset-4 decoration-[#FF1E56]">Home</span>
                  <span>Movies</span>
                  <span>My List</span>
                </div>
              </div>

              {/* Hero Content */}
              <div className="relative z-10 max-w-sm space-y-2 py-2">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Oppenheimer
                </h3>
                <p className="text-xs font-semibold text-white/90 line-clamp-2 leading-relaxed">
                  The pulse-pounding story of J. Robert Oppenheimer and the Manhattan Project — racing against the Nazis to build the atomic bomb.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={onExplore}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black font-extrabold text-xs hover:bg-gray-200 transition-all cursor-pointer shadow-md"
                  >
                    <Play className="w-3 h-3 fill-black" />
                    <span>Play</span>
                  </button>
                  <button
                    onClick={onExplore}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 text-white font-bold text-xs hover:bg-white/30 transition-all cursor-pointer border border-white/20"
                  >
                    <Info className="w-3 h-3" />
                    <span>Details</span>
                  </button>
                </div>
              </div>

              {/* Mini Shelf */}
              <div className="relative z-10 pt-3 border-t border-white/10">
                <p className="text-[11px] font-extrabold text-white mb-2 tracking-wide">Continue Watching</p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { title: 'Mirzapur', img: '/poster-mirzapur.jpg' },
                    { title: 'Shawshank', img: '/poster-shawshank.jpg' },
                    { title: 'American Psycho', img: '/poster-american-psycho.png' },
                    { title: 'Oppenheimer', img: 'https://image.tmdb.org/t/p/w780/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg' }
                  ].map((m, idx) => (
                    <div key={idx} className="relative rounded-lg overflow-hidden aspect-[2/3] border border-white/15 bg-black/60 group">
                      <img src={m.img} alt={m.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                      <span className="absolute bottom-1 left-1.5 right-1 text-[9px] font-bold text-white truncate">
                        {m.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: High-Contrast Description Card */}
        <div className="w-full md:w-[40%] lg:w-[42%] text-left">
          <div className="p-6 sm:p-7 rounded-2xl bg-[#090611]/95 backdrop-blur-2xl border border-white/20 shadow-2xl space-y-3">
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Cinema Universe
            </h3>
            <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
              Personalized shelves, instant resume playback, and fluid carousels designed for pure immersion.
            </p>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 2. MUSIC SECTION (Right Side, Medium Size)                        */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col-reverse md:flex-row items-center gap-8 lg:gap-12">
        {/* Left Side: High-Contrast Description Card */}
        <div className="w-full md:w-[40%] lg:w-[42%] text-left">
          <div className="p-6 sm:p-7 rounded-2xl bg-[#070C1A]/95 backdrop-blur-2xl border border-white/20 shadow-2xl space-y-3">
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Sound Studio
            </h3>
            <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
              High-fidelity master audio with real-time live equalizers, full scrubbing controls, and seamless background playback.
            </p>
          </div>
        </div>

        {/* Right Side: Window Snapshot */}
        <div className="w-full md:w-[60%] lg:w-[58%] shrink-0">
          <div className="relative rounded-2xl border border-white/20 bg-[#09070F] shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden transition-all duration-300 hover:border-cyan-500/50">
            {/* macOS Window Titlebar */}
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#0E0B16] border-b border-white/[0.1] select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
              </div>
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.06] text-[10px] font-mono text-white/80 font-bold">
                <Lock className="w-2.5 h-2.5 text-emerald-400" />
                <span>zhoosh.stream/music</span>
              </div>
              <div className="w-8" />
            </div>

            {/* Window Content */}
            <div className="relative bg-[#060814] p-4 sm:p-5 flex flex-col justify-between min-h-[300px] sm:min-h-[340px]">
              {/* Top Bar Mockup */}
              <div className="flex items-center justify-between text-xs text-white pb-3 border-b border-white/10">
                <span className="font-black text-[#00D2FF] text-xs tracking-wider">ZHOOSH STUDIO</span>
                <div className="flex items-center gap-3 text-[11px] font-bold text-white/90">
                  <span className="text-white font-black underline underline-offset-4 decoration-cyan-400">Discover</span>
                  <span>Playlists</span>
                  <span>Artists</span>
                </div>
              </div>

              {/* Main Track Display */}
              <div className="flex items-center gap-4 sm:gap-5 py-4 my-auto">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shadow-xl border border-white/20 shrink-0 bg-black/50">
                  <img
                    src="https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/600x600bb.jpg"
                    alt="Track Art"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-[#00D2FF] text-black flex items-center justify-center shadow-md">
                      <Play className="w-4 h-4 fill-black ml-0.5" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 min-w-0">
                  <h4 className="text-base sm:text-lg font-black text-white truncate">
                    Perfect
                  </h4>
                  <p className="text-xs font-bold text-white/90 truncate">
                    Ed Sheeran
                  </p>
                  <p className="text-[11px] font-semibold text-white/80">
                    ÷ (Divide) • 2.9B+ Streams
                  </p>

                  {/* Equalizer Visualizer Bars */}
                  <div className="flex items-center gap-1 pt-2">
                    {[4, 12, 8, 16, 10, 14, 6, 12, 18, 9, 14, 7].map((h, i) => (
                      <span
                        key={i}
                        className="w-1 bg-cyan-400 rounded-full animate-pulse"
                        style={{
                          height: `${h + 2}px`,
                          animationDelay: `${i * 100}ms`
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Player Bar */}
              <div className="p-2.5 rounded-xl bg-[#0A0F20] border border-white/15 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src="https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/600x600bb.jpg"
                    alt="Mini Art"
                    className="w-8 h-8 rounded object-cover"
                  />
                  <div className="truncate">
                    <p className="text-[11px] font-black text-white truncate">Perfect</p>
                    <p className="text-[9px] font-bold text-white/80 truncate">Ed Sheeran</p>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1 flex-1 max-w-[180px]">
                  <div className="flex items-center gap-3 text-white">
                    <SkipBack className="w-3 h-3 cursor-pointer" />
                    <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center">
                      <Play className="w-3 h-3 fill-black ml-0.2" />
                    </div>
                    <SkipForward className="w-3 h-3 cursor-pointer" />
                  </div>
                  <div className="w-full flex items-center gap-1.5 text-[9px] font-mono font-bold text-white/90">
                    <span>2:45</span>
                    <div className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400 w-3/5 rounded-full" />
                    </div>
                    <span>4:23</span>
                  </div>
                </div>

                <Volume2 className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 3. CHATBOT SECTION (Left Side, Medium Size)                       */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-center gap-8 lg:gap-12">
        {/* Left Side: Window Snapshot */}
        <div className="w-full md:w-[60%] lg:w-[58%] shrink-0">
          <div className="relative rounded-2xl border border-white/20 bg-[#09070F] shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden transition-all duration-300 hover:border-purple-500/50">
            {/* macOS Window Titlebar */}
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#0E0B16] border-b border-white/[0.1] select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
              </div>
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.06] text-[10px] font-mono text-white/80 font-bold">
                <Lock className="w-2.5 h-2.5 text-emerald-400" />
                <span>zhoosh.stream/nova</span>
              </div>
              <div className="w-8" />
            </div>

            {/* Window Content */}
            <div className="relative bg-[#090511] p-4 sm:p-5 flex flex-col justify-between min-h-[300px] sm:min-h-[340px]">
              {/* Header */}
              <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
                <div className="w-6 h-6 rounded-full overflow-hidden border border-purple-400">
                  <img src="/agent-avatar.jpg" alt="Nova" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-xs font-black text-white leading-none">Nova AI</p>
                  <p className="text-[9px] font-bold text-emerald-400">Online</p>
                </div>
              </div>

              {/* Chat Conversation */}
              <div className="space-y-3 py-2 my-auto">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="max-w-xs p-2.5 rounded-xl rounded-tr-none bg-purple-700/60 border border-purple-500/40 text-white font-bold text-xs shadow-md">
                    "Recommend a mind-bending sci-fi movie with an awesome score."
                  </div>
                </div>

                {/* Nova Response */}
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-purple-400 shrink-0 mt-0.5">
                    <img src="/agent-avatar.jpg" alt="Nova Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="max-w-xs sm:max-w-sm p-3 rounded-xl rounded-tl-none bg-[#130B21] border border-purple-500/30 text-white text-xs space-y-2 shadow-lg">
                    <p className="text-white font-semibold leading-relaxed">
                      I recommend <strong className="text-white font-black">Interstellar</strong>. I've also paired it with Hans Zimmer's "Cornfield Chase".
                    </p>
                    <div className="p-2 rounded-lg bg-black/60 border border-white/15 flex items-center gap-2.5">
                      <img
                        src="/poster-brand-new-day.jpg"
                        alt="Interstellar"
                        className="w-8 h-11 rounded object-cover border border-white/10 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-black text-white text-[11px] truncate">Interstellar (2014)</p>
                        <p className="text-[9px] font-bold text-purple-300 truncate">Score: Cornfield Chase</p>
                        <button
                          onClick={onExplore}
                          className="mt-1 px-2.5 py-0.5 rounded bg-[#FF1E56] text-[9px] font-extrabold text-white flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="w-2 h-2 fill-white" />
                          <span>Play</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Input Mockup */}
              <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white/[0.08] border border-purple-500/40">
                <Mic className="w-3.5 h-3.5 text-purple-300 ml-1" />
                <input
                  type="text"
                  readOnly
                  value="Ask Nova anything..."
                  className="w-full bg-transparent text-xs font-semibold text-white/90 focus:outline-none cursor-default"
                />
                <button className="p-1.5 rounded-lg bg-purple-600 text-white font-bold">
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: High-Contrast Description Card */}
        <div className="w-full md:w-[40%] lg:w-[42%] text-left">
          <div className="p-6 sm:p-7 rounded-2xl bg-[#0E081A]/95 backdrop-blur-2xl border border-white/20 shadow-2xl space-y-3">
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              AI Companion
            </h3>
            <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
              Chat naturally with Nova or SonicBot to find hidden gems, curate custom moods, and link cinema with music.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
