import React, { useState, useCallback } from 'react';
import { GameState, Beatmap, Score, Judgement } from './types';
import { generateBeatmap } from './services/geminiService';
import StartScreen from './components/StartScreen';
import Game from './components/Game';
import ResultsScreen from './components/ResultsScreen';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.Ready);
  const [beatmap, setBeatmap] = useState<Beatmap | null>(null);
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
  const [error, setError] = useState<string | null>(null);

  const handleStart = useCallback(async (prompt: string) => {
    setGameState(GameState.Loading);
    setError(null);
    try {
      const newBeatmap = await generateBeatmap(prompt);
      // Sort notes by time to ensure proper gameplay
      newBeatmap.sort((a, b) => a.time - b.time);
      setBeatmap(newBeatmap);
      setScore({
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
      setGameState(GameState.Playing);
    } catch (err) {
      console.error(err);
      setError('Failed to generate beatmap. Please try a different prompt.');
      setGameState(GameState.Ready);
    }
  }, []);

  const handleGameFinish = useCallback((finalScore: Score) => {
    setScore(finalScore);
    setGameState(GameState.Finished);
  }, []);

  const handleRestart = useCallback(() => {
    setBeatmap(null);
    setScore({
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
    setGameState(GameState.Ready);
  }, []);

  const renderContent = () => {
    switch (gameState) {
      case GameState.Ready:
        return <StartScreen onStart={handleStart} error={error} />;
      case GameState.Loading:
        return (
            <div className="flex flex-col items-center justify-center text-white h-full">
                <Loader2 className="w-16 h-16 animate-spin text-purple-400" />
                <p className="mt-4 text-lg font-orbitron">Generating your cosmic beatmap...</p>
            </div>
        );
      case GameState.Playing:
        return beatmap ? (
          <Game beatmap={beatmap} onGameFinish={handleGameFinish} />
        ) : null;
      case GameState.Finished:
        return <ResultsScreen score={score} onRestart={handleRestart} />;
      default:
        return null;
    }
  };

  return (
    <main className="bg-slate-900 min-h-screen text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg h-[80vh] min-h-[600px] bg-black bg-opacity-40 rounded-2xl shadow-2xl shadow-purple-500/20 border border-slate-700 flex flex-col overflow-hidden">
        {renderContent()}
      </div>
    </main>
  );
};

export default App;
