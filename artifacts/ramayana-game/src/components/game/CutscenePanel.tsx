import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/game/store';

export default function CutscenePanel() {
  const store = useGameStore();
  const { cutsceneText, cutsceneSpeaker, showCutscene } = store;
  const [displayedText, setDisplayedText] = useState('');
  const [textComplete, setTextComplete] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!showCutscene) return;
    setDisplayedText('');
    setTextComplete(false);
    let i = 0;

    const typeNext = () => {
      if (i < cutsceneText.length) {
        setDisplayedText(cutsceneText.slice(0, i + 1));
        i++;
        const delay = cutsceneText[i - 1] === '.' || cutsceneText[i - 1] === ',' ? 60 : 18;
        timeoutRef.current = setTimeout(typeNext, delay);
      } else {
        setTextComplete(true);
      }
    };

    timeoutRef.current = setTimeout(typeNext, 100);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [showCutscene, cutsceneText]);

  const skipOrContinue = () => {
    if (!textComplete) {
      setDisplayedText(cutsceneText);
      setTextComplete(true);
    } else {
      store.dismissCutscene();
    }
  };

  if (!showCutscene) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-end"
      style={{
        background: 'linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 40%, transparent 100%)'
      }}
    >
      {/* Decorative top border of dialogue box */}
      <div
        className="w-full max-w-4xl mx-4 mb-6 relative"
        style={{ padding: '0 16px' }}
      >
        {/* Sanskrit decorative header */}
        <div
          className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-6 py-0.5 text-xs tracking-widest"
          style={{
            background: 'linear-gradient(135deg, #1a0c00, #2d1500)',
            border: '1px solid #8B6914',
            color: '#c8a000',
            fontFamily: 'serif',
            whiteSpace: 'nowrap',
            letterSpacing: '0.3em'
          }}
        >
          ॥ श्री राम ॥
        </div>

        <div
          className="p-6 pt-8"
          style={{
            background: 'linear-gradient(135deg, rgba(5,2,0,0.97), rgba(15,8,0,0.97))',
            border: '1px solid #5c3800',
            borderTop: '2px solid #8B6914',
            boxShadow: '0 -10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(180,120,0,0.2)'
          }}
        >
          {/* Speaker name */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className="text-xs px-3 py-1 font-bold tracking-wider uppercase"
              style={{
                background: 'rgba(100,60,0,0.4)',
                border: '1px solid #5c3800',
                color: '#FFD700',
                fontFamily: 'serif',
                letterSpacing: '0.2em'
              }}
            >
              ⋆ {cutsceneSpeaker} ⋆
            </div>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, #5c3800, transparent)' }} />
          </div>

          {/* Dialogue text */}
          <p
            className="leading-relaxed text-base"
            style={{
              color: '#e8d090',
              fontFamily: '"Palatino Linotype", Palatino, Georgia, serif',
              minHeight: '4.5rem',
              fontSize: '1rem',
              lineHeight: 1.8
            }}
          >
            {displayedText}
            {!textComplete && (
              <span
                className="inline-block ml-0.5"
                style={{
                  width: '2px',
                  height: '1em',
                  background: '#FFD700',
                  animation: 'blink 0.8s infinite',
                  verticalAlign: 'middle'
                }}
              />
            )}
          </p>

          {/* Continue button */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-xs" style={{ color: '#3a2800', fontFamily: 'serif' }}>
              {textComplete ? '' : 'Receiving divine transmission...'}
            </div>
            <button
              onClick={skipOrContinue}
              className="px-5 py-2 text-sm font-bold tracking-wider transition-all active:scale-95"
              style={{
                background: textComplete ? 'rgba(100,60,0,0.6)' : 'rgba(30,15,0,0.6)',
                border: textComplete ? '1px solid #8B6914' : '1px solid #3a2000',
                color: textComplete ? '#FFD700' : '#5a3800',
                fontFamily: 'serif',
                letterSpacing: '0.1em',
                minWidth: 120
              }}
            >
              {textComplete ? '▶ Continue' : '⟫ Skip'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  );
}
