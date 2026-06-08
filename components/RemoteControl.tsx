import React from "react";

interface RemoteControlProps {
  onNumberPress: (num: number) => void;
  onChannelUp: () => void;
  onChannelDown: () => void;
  onVolumeUp: () => void;
  onVolumeDown: () => void;
  onMuteToggle: () => void;
  onGuidePress: () => void;
  onEnterPress: () => void;
  isMuted: boolean;
}

export default function RemoteControl({
  onNumberPress,
  onChannelUp,
  onChannelDown,
  onVolumeUp,
  onVolumeDown,
  onMuteToggle,
  onGuidePress,
  onEnterPress,
  isMuted,
}: RemoteControlProps) {
  // Ultra-realistic 90s brushed metal styling
  const brushedMetalStyle = {
    background: `
      repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 2px),
      repeating-linear-gradient(90deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 3px),
      linear-gradient(to right, #9ca3af 0%, #cbd5e1 15%, #f1f5f9 45%, #cbd5e1 80%, #64748b 100%)
    `,
    boxShadow: "inset 0 1px 1px rgba(255,255,255,0.3), inset 0 -1px 2px rgba(0,0,0,0.3)",
  };

  return (
    <div className="w-56 h-[400px] bg-[#161618] rounded-[1rem] overflow-hidden border border-neutral-800 flex flex-col justify-between select-none">
      
      {/* Top Plastic Bezel / Grip */}
      <div className="h-11 bg-gradient-to-b from-[#1c1c1e] to-[#121213] relative flex items-center justify-center border-b border-black/30 shadow-[inset_0_-1px_3px_rgba(0,0,0,0.4)]">
        {/* IR Blaster Translucent Window */}
        <div className="w-12 h-1.5 bg-[#4c0519] rounded-full border border-red-950/40 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] opacity-90 flex items-center justify-center">
          <div className="w-4 h-0.5 bg-red-600/40 blur-[0.5px] rounded-full" />
        </div>
      </div>

      {/* Brushed Metal Plate (Container) */}
      <div 
        style={brushedMetalStyle} 
        className="flex-1 relative border-l-2 border-r-2 border-[#121213]"
      >
        {/* Zenith Brand Logo Section */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <svg viewBox="0 0 120 24" className="w-28 h-6 text-[#151516] fill-current">
            <g transform="skewX(-14)">
              {/* Bold Zenith 'Z' with iconic lightning bolt horizontal strike */}
              <path
                d="M 11 3 L 26 3 L 26 6 L 15 17 L 27 17 L 27 20 L 9 20 L 9 17 L 19 6 L 11 6 Z"
              />
              <path
                d="M 5 12 L 15 12 L 14 10 L 22.5 13.5 L 21.5 11.5 L 30 11.5 L 22 13.5 L 23 15.5 L 14.5 12 L 15.5 13.5 Z"
              />
              {/* "ENITH" text in ultra-heavy sans-serif */}
              <text
                x="32"
                y="17.5"
                className="font-sans font-[950] text-[13.5px] tracking-[0.03em] select-none"
                fill="currentColor"
              >
                ENITH
              </text>
            </g>
          </svg>
          
          {/* Authentic horizontal divider line below logo */}
          <div className="w-[190px] h-[1px] bg-black/35 mt-3 shadow-[0_0.5px_0_rgba(255,255,255,0.25)]" />
        </div>

        {/* 5x4 Grid of Tactile Rubbery Buttons */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 grid grid-cols-4 gap-x-2.5 gap-y-5 w-full px-3.5 justify-items-center">
          
          {/* ROW 1: FLASHBACK | SLEEP | (EMPTY) | OFF-ON */}
          <div className="relative flex items-center justify-center">
            <span className="absolute top-[-11px] text-[8px] font-sans font-extrabold text-[#111112]/85 tracking-wider uppercase select-none pointer-events-none leading-none text-center">
              GUIDE
            </span>
            <button
              onClick={onGuidePress}
              className="w-[40px] h-[26px] bg-[#222224] rounded-[5px] shadow-[0_2px_0_#0f0f10,_inset_1.5px_1.5px_1px_rgba(255,255,255,0.1),_inset_-1.5px_-1.5px_1.5px_rgba(0,0,0,0.5)] active:translate-y-[1px] active:shadow-[0_1px_0_#0f0f10,_inset_1px_1px_1.5px_rgba(0,0,0,0.6)] active:bg-[#18181a] transition-all flex items-center justify-center cursor-pointer"
              title="Flashback / Guide"
            />
          </div>

          <div className="relative flex items-center justify-center">
            <span className="absolute top-[-11px] text-[8px] font-sans font-extrabold text-[#111112]/85 tracking-wider uppercase select-none pointer-events-none">
              SLEEP
            </span>
            <button
              onClick={() => {}}
              className="w-[40px] h-[26px] bg-[#222224] rounded-[5px] shadow-[0_2px_0_#0f0f10,_inset_1.5px_1.5px_1px_rgba(255,255,255,0.1),_inset_-1.5px_-1.5px_1.5px_rgba(0,0,0,0.5)] active:translate-y-[1px] active:shadow-[0_1px_0_#0f0f10,_inset_1px_1px_1.5px_rgba(0,0,0,0.6)] active:bg-[#18181a] transition-all flex items-center justify-center cursor-pointer"
              title="Sleep Timer (Mock)"
            />
          </div>

          {/* Empty spacer to align red button perfectly on the rightmost column */}
          <div className="w-[40px] h-[26px] select-none pointer-events-none" />

          <div className="relative flex items-center justify-center">
            <span className="absolute top-[-11px] text-[8px] font-sans font-extrabold text-[#ab2b2b] tracking-wider uppercase select-none pointer-events-none">
              OFF-ON
            </span>
            <button
              onClick={onMuteToggle} // Satisfying click that does mute toggle
              className="w-[40px] h-[26px] bg-[#ac2e2e] rounded-[5px] shadow-[0_2px_0_#5a1212,_inset_1.5px_1.5px_1px_rgba(255,255,255,0.25),_inset_-1.5px_-1.5px_1.5px_rgba(0,0,0,0.5)] active:translate-y-[1px] active:shadow-[0_1px_0_#5a1212,_inset_1px_1px_1.5px_rgba(0,0,0,0.7)] active:bg-[#8d2121] transition-all flex items-center justify-center cursor-pointer"
              title="Power / Toggle Mute"
            />
          </div>

          {/* ROW 2: 1 | 2 | 3 | CHANNEL UP */}
          {[1, 2, 3].map((num) => (
            <div key={num} className="relative flex items-center justify-center">
              <button
                onClick={() => onNumberPress(num)}
                className="w-[40px] h-[26px] bg-[#222224] rounded-[5px] shadow-[0_2px_0_#0f0f10,_inset_1.5px_1.5px_1px_rgba(255,255,255,0.1),_inset_-1.5px_-1.5px_1.5px_rgba(0,0,0,0.5)] active:translate-y-[1px] active:shadow-[0_1px_0_#0f0f10,_inset_1px_1px_1.5px_rgba(0,0,0,0.6)] active:bg-[#18181a] transition-all flex items-center justify-center font-sans font-extrabold text-[12px] text-gray-200 select-none cursor-pointer"
              >
                <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">{num}</span>
              </button>
            </div>
          ))}
          <div className="relative flex items-center justify-center">
            <span className="absolute bottom-[-13px] text-[7.5px] font-sans font-extrabold text-[#111112]/85 tracking-widest uppercase select-none pointer-events-none">
              CHANNEL
            </span>
            <button
              onClick={onChannelUp}
              className="w-[40px] h-[26px] bg-[#222224] rounded-[5px] shadow-[0_2px_0_#0f0f10,_inset_1.5px_1.5px_1px_rgba(255,255,255,0.1),_inset_-1.5px_-1.5px_1.5px_rgba(0,0,0,0.5)] active:translate-y-[1px] active:shadow-[0_1px_0_#0f0f10,_inset_1px_1px_1.5px_rgba(0,0,0,0.6)] active:bg-[#18181a] transition-all flex items-center justify-center cursor-pointer"
              title="Channel Up"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-gray-200 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                <path d="M12 6l-7 9h14z" />
              </svg>
            </button>
          </div>

          {/* ROW 3: 4 | 5 | 6 | CHANNEL DOWN */}
          {[4, 5, 6].map((num) => (
            <div key={num} className="relative flex items-center justify-center">
              <button
                onClick={() => onNumberPress(num)}
                className="w-[40px] h-[26px] bg-[#222224] rounded-[5px] shadow-[0_2px_0_#0f0f10,_inset_1.5px_1.5px_1px_rgba(255,255,255,0.1),_inset_-1.5px_-1.5px_1.5px_rgba(0,0,0,0.5)] active:translate-y-[1px] active:shadow-[0_1px_0_#0f0f10,_inset_1px_1px_1.5px_rgba(0,0,0,0.6)] active:bg-[#18181a] transition-all flex items-center justify-center font-sans font-extrabold text-[12px] text-gray-200 select-none cursor-pointer"
              >
                <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">{num}</span>
              </button>
            </div>
          ))}
          <div className="relative flex items-center justify-center">
            <button
              onClick={onChannelDown}
              className="w-[40px] h-[26px] bg-[#222224] rounded-[5px] shadow-[0_2px_0_#0f0f10,_inset_1.5px_1.5px_1px_rgba(255,255,255,0.1),_inset_-1.5px_-1.5px_1.5px_rgba(0,0,0,0.5)] active:translate-y-[1px] active:shadow-[0_1px_0_#0f0f10,_inset_1px_1px_1.5px_rgba(0,0,0,0.6)] active:bg-[#18181a] transition-all flex items-center justify-center cursor-pointer"
              title="Channel Down"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-gray-200 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                <path d="M12 18l7-9H5z" />
              </svg>
            </button>
          </div>

          {/* ROW 4: 7 | 8 | 9 | VOLUME UP */}
          {[7, 8, 9].map((num) => (
            <div key={num} className="relative flex items-center justify-center">
              <button
                onClick={() => onNumberPress(num)}
                className="w-[40px] h-[26px] bg-[#222224] rounded-[5px] shadow-[0_2px_0_#0f0f10,_inset_1.5px_1.5px_1px_rgba(255,255,255,0.1),_inset_-1.5px_-1.5px_1.5px_rgba(0,0,0,0.5)] active:translate-y-[1px] active:shadow-[0_1px_0_#0f0f10,_inset_1px_1px_1.5px_rgba(0,0,0,0.6)] active:bg-[#18181a] transition-all flex items-center justify-center font-sans font-extrabold text-[12px] text-gray-200 select-none cursor-pointer"
              >
                <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">{num}</span>
              </button>
            </div>
          ))}
          <div className="relative flex items-center justify-center">
            <span className="absolute bottom-[-13px] text-[7.5px] font-sans font-extrabold text-[#111112]/85 tracking-widest uppercase select-none pointer-events-none">
              VOLUME
            </span>
            <button
              onClick={onVolumeUp}
              className="w-[40px] h-[26px] bg-[#222224] rounded-[5px] shadow-[0_2px_0_#0f0f10,_inset_1.5px_1.5px_1px_rgba(255,255,255,0.1),_inset_-1.5px_-1.5px_1.5px_rgba(0,0,0,0.5)] active:translate-y-[1px] active:shadow-[0_1px_0_#0f0f10,_inset_1px_1px_1.5px_rgba(0,0,0,0.6)] active:bg-[#18181a] transition-all flex items-center justify-center cursor-pointer"
              title="Volume Up"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-gray-200 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                <path d="M12 6l-7 9h14z" />
              </svg>
            </button>
          </div>

          {/* ROW 5: ENTER | 0 | MUTE | VOLUME DOWN */}
          <div className="relative flex items-center justify-center">
            <span className="absolute top-[-11px] text-[8px] font-sans font-extrabold text-[#111112]/85 tracking-wider uppercase select-none pointer-events-none">
              ENTER
            </span>
            <button
              onClick={onEnterPress}
              className="w-[40px] h-[26px] bg-[#222224] rounded-[5px] shadow-[0_2px_0_#0f0f10,_inset_1.5px_1.5px_1px_rgba(255,255,255,0.1),_inset_-1.5px_-1.5px_1.5px_rgba(0,0,0,0.5)] active:translate-y-[1px] active:shadow-[0_1px_0_#0f0f10,_inset_1px_1px_1.5px_rgba(0,0,0,0.6)] active:bg-[#18181a] transition-all flex items-center justify-center cursor-pointer"
              title="Enter / Fullscreen"
            />
          </div>

          <div className="relative flex items-center justify-center">
            <button
              onClick={() => onNumberPress(0)}
              className="w-[40px] h-[26px] bg-[#222224] rounded-[5px] shadow-[0_2px_0_#0f0f10,_inset_1.5px_1.5px_1px_rgba(255,255,255,0.1),_inset_-1.5px_-1.5px_1.5px_rgba(0,0,0,0.5)] active:translate-y-[1px] active:shadow-[0_1px_0_#0f0f10,_inset_1px_1px_1.5px_rgba(0,0,0,0.6)] active:bg-[#18181a] transition-all flex items-center justify-center font-sans font-extrabold text-[12px] text-gray-200 select-none cursor-pointer"
            >
              <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">0</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <span className="absolute top-[-11px] text-[8px] font-sans font-extrabold text-[#111112]/85 tracking-wider uppercase select-none pointer-events-none">
              MUTE
            </span>
            <button
              onClick={onMuteToggle}
              className={`w-[40px] h-[26px] rounded-[5px] transition-all flex items-center justify-center cursor-pointer ${
                isMuted
                  ? "bg-[#ac2e2e] shadow-[0_2px_0_#5a1212,_inset_1.5px_1.5px_1px_rgba(255,255,255,0.25),_inset_-1.5px_-1.5px_1.5px_rgba(0,0,0,0.5)] active:translate-y-[1px] active:shadow-[0_1px_0_#5a1212,_inset_1px_1px_1.5px_rgba(0,0,0,0.7)] active:bg-[#8d2121]"
                  : "bg-[#222224] shadow-[0_2px_0_#0f0f10,_inset_1.5px_1.5px_1px_rgba(255,255,255,0.1),_inset_-1.5px_-1.5px_1.5px_rgba(0,0,0,0.5)] active:translate-y-[1px] active:shadow-[0_1px_0_#0f0f10,_inset_1px_1px_1.5px_rgba(0,0,0,0.6)] active:bg-[#18181a]"
              }`}
              title="Mute Toggle"
            />
          </div>

          <div className="relative flex items-center justify-center">
            <button
              onClick={onVolumeDown}
              className="w-[40px] h-[26px] bg-[#222224] rounded-[5px] shadow-[0_2px_0_#0f0f10,_inset_1.5px_1.5px_1px_rgba(255,255,255,0.1),_inset_-1.5px_-1.5px_1.5px_rgba(0,0,0,0.5)] active:translate-y-[1px] active:shadow-[0_1px_0_#0f0f10,_inset_1px_1px_1.5px_rgba(0,0,0,0.6)] active:bg-[#18181a] transition-all flex items-center justify-center cursor-pointer"
              title="Volume Down"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-gray-200 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                <path d="M12 18l7-9H5z" />
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* Bottom Plastic Bezel / Grip Handle */}
      <div className="h-10 bg-gradient-to-b from-[#121213] to-[#1a1a1c] relative flex flex-col items-center justify-center shadow-[inset_0_1px_3px_rgba(255,255,255,0.05)] border-t border-black/50">
        {/* Subtle decorative finger grooves/bevel lines to look like chunky plastic molds */}
        <div className="absolute top-2 w-[85%] h-[1px] bg-black/45" />
        <div className="absolute top-[10px] w-[85%] h-[1px] bg-white/5" />
        <div className="text-white/5 font-mono text-[9px] tracking-wider uppercase pointer-events-none select-none">
          SYSTEM REMOTE
        </div>
      </div>

    </div>
  );
}
