import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Beatmap, Score, Judgement, Note as NoteType } from '../types';
import {
  LANE_COUNT,
  NOTE_SPEED,
  KEY_MAPPINGS,
  LANE_KEYS,
  TIMING_WINDOWS,
  JUDGEMENT_SCORES,
  JUDGEMENT_COLORS,
  GAME_DURATION_MS
} from '../constants';
import { BarChart, Gauge } from 'lucide-react';

interface GameProps {
  beatmap: Beatmap;
  onGameFinish: (finalScore: Score) => void;
}

const Game: React.FC<GameProps> = ({ beatmap, onGameFinish }) => {
  const [startTime, setStartTime] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [notes, setNotes] = useState<NoteType[]>(beatmap);
  const [score, setScore] = useState<Score>({
    points: 0,
    combo: 0,
    maxCombo: 0,
    judgements: {
      [Judgement.Perfect]: 0,
      [Judgement.Great]: 0,
      [Judgement.Good]: 0,
      [Judgement.Miss]: 0,
    },
  });
  const [lastJudgement, setLastJudgement] = useState<{ judgement: Judgement; id: number } | null>(null);
  const [hitEffects, setHitEffects] = useState<{ [lane: number]: number }>({});

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const gameLoopRef = useRef<number>();
  const gameAreaHeight = gameAreaRef.current?.clientHeight || 600;
  const hitPosition = gameAreaHeight - 50;

  const updateScore = useCallback((judgement: Judgement, points: number) => {
    setScore(prev => {
      const newCombo = judgement !== Judgement.Miss ? prev.combo + 1 : 0;
      const newMaxCombo = Math.max(prev.maxCombo, newCombo);
      return {
        points: prev.points + points,
        combo: newCombo,
        maxCombo: newMaxCombo,
        judgements: {
          ...prev.judgements,
          [judgement]: prev.judgements[judgement] + 1,
        },
      };
    });
    setLastJudgement({ judgement, id: Date.now() });
  }, []);
  
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
      const lane = KEY_MAPPINGS[event.key.toLowerCase()];
      if (lane === undefined) return;
  
      const targetTime = currentTime;
      const nextNoteIndex = notes.findIndex(note => !note.judged && note.lane === lane);
  
      if (nextNoteIndex === -1) return;
  
      const note = notes[nextNoteIndex];
      const timeDiff = Math.abs(note.time - targetTime);
      
      let judgement: Judgement | null = null;
      if (timeDiff <= TIMING_WINDOWS.Perfect) judgement = Judgement.Perfect;
      else if (timeDiff <= TIMING_WINDOWS.Great) judgement = Judgement.Great;
      else if (timeDiff <= TIMING_WINDOWS.Good) judgement = Judgement.Good;
      // Misses are handled by the game loop, not key presses outside the window
  
      if (judgement) {
          updateScore(judgement, JUDGEMENT_SCORES[judgement]);
          setNotes(prev => prev.map((n, i) => i === nextNoteIndex ? { ...n, judged: true } : n));
          setHitEffects(prev => ({ ...prev, [lane]: Date.now() }));
      }
  }, [currentTime, notes, updateScore]);

  useEffect(() => {
    setStartTime(Date.now());
    
    const gameLoop = () => {
        const elapsed = Date.now() - startTime;
        setCurrentTime(elapsed);

        // Check for missed notes
        setNotes(currentNotes => {
            const updatedNotes = [...currentNotes];
            let changed = false;
            for(let i = 0; i < updatedNotes.length; i++){
                const note = updatedNotes[i];
                if (!note.judged && elapsed > note.time + TIMING_WINDOWS.Miss) {
                    note.judged = true;
                    updateScore(Judgement.Miss, 0);
                    changed = true;
                }
            }
            return changed ? updatedNotes : currentNotes;
        });
        
        // The game finish logic is handled by the second useEffect to avoid stale state.
        gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      window.removeEventListener('keydown', handleKeyPress);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // This separate useEffect handles the finish condition to avoid stale score state in the game loop.
  useEffect(() => {
    if (currentTime >= GAME_DURATION_MS + 2000) {
       if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
       onGameFinish(score);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime, score]);


  return (
    <div className="h-full flex flex-col relative" ref={gameAreaRef}>
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-20">
            <div className='font-mono text-cyan-300 text-3xl font-black'>{score.points.toLocaleString()}</div>
            <div className='text-right'>
                {score.combo > 2 && (
                    <div className='font-orbitron font-bold text-4xl text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300'>
                        {score.combo} <span className="text-xl">COMBO</span>
                    </div>
                )}
                <div className='text-sm text-slate-400'>MAX: {score.maxCombo}</div>
            </div>
        </div>

        {/* Judgement Text */}
        {lastJudgement && (
            <div key={lastJudgement.id} className="judgement-text-effect absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                <p className={`font-orbitron font-black text-5xl drop-shadow-lg ${JUDGEMENT_COLORS[lastJudgement.judgement]}`}>
                    {lastJudgement.judgement}
                </p>
            </div>
        )}

        {/* Game Area */}
        <div className="flex-grow relative overflow-hidden">
            <div className="absolute inset-0 flex justify-around border-x-2 border-slate-700 mx-auto w-80">
                {Array.from({ length: LANE_COUNT }).map((_, i) => (
                    <div key={i} className="w-full h-full border-r-2 border-slate-800 last:border-r-0"></div>
                ))}
            </div>

            {/* Notes */}
            {notes.map(note => {
                if (note.judged) return null;
                const yPos = (currentTime - note.time) * NOTE_SPEED + hitPosition;
                if (yPos < -50 || yPos > gameAreaHeight) return null; // Cull off-screen notes
                
                return (
                    <div
                        key={note.id}
                        className="absolute w-20 h-6 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-md shadow-lg shadow-cyan-500/50"
                        style={{
                            left: `${note.lane * 25}%`,
                            transform: `translateY(${-yPos}px)`,
                        }}
                    ></div>
                );
            })}
        </div>

        {/* Hit Zone */}
        <div className="absolute bottom-0 left-0 right-0 h-[100px] bg-gradient-to-t from-black/80 to-transparent z-10">
             <div className="absolute w-80 h-[2px] bg-gradient-to-r from-purple-500 to-cyan-400 top-[50px] left-1/2 -translate-x-1/2 shadow-[0_0_15px_2px_rgba(74,222,128,0.7)]"></div>
             <div className="absolute top-[50px] left-1/2 -translate-x-1/2 w-80 flex justify-around">
                {LANE_KEYS.map((key, i) => {
                    const effectTime = hitEffects[i];
                    const isActive = effectTime && (Date.now() - effectTime) < 150;
                    return (
                        <div key={key} className="w-1/4 h-16 flex items-center justify-center -translate-y-1/2">
                           <div className={`w-20 h-6 rounded-md transition-all duration-100 flex items-center justify-center font-orbitron font-bold
                                ${isActive ? 'bg-cyan-300 text-slate-900 shadow-[0_0_20px_5px_rgba(107,227,242,0.7)]' : 'bg-slate-700/50 text-slate-400'}`}>
                               {key}
                           </div>
                        </div>
                    );
                })}
             </div>
        </div>
    </div>
  );
};

export default Game;
