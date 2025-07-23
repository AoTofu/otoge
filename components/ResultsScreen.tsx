import React from 'react';
import { Score, Judgement } from '../types';
import { RefreshCw } from 'lucide-react';
import { JUDGEMENT_COLORS } from '../constants';

interface ResultsScreenProps {
  score: Score;
  onRestart: () => void;
}

const StatItem: React.FC<{ label: Judgement | 'Max Combo'; value: number, color?: string }> = ({ label, value, color }) => (
    <div className={`flex justify-between items-baseline p-3 rounded-lg ${label === 'Max Combo' ? 'bg-slate-700' : 'bg-slate-800/50'}`}>
        <span className={`font-orbitron font-bold text-lg ${color || 'text-white'}`}>{label}</span>
        <span className="font-mono text-2xl font-bold text-slate-200">{value}</span>
    </div>
);


const ResultsScreen: React.FC<ResultsScreenProps> = ({ score, onRestart }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-gradient-to-b from-slate-900 to-indigo-900/50">
      <h1 className="text-5xl font-black font-orbitron tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400 mb-4">
        Results
      </h1>

      <div className="w-full max-w-sm mb-8 p-6 bg-slate-800/60 rounded-xl border border-slate-700">
        <div className="text-center mb-6">
            <p className="text-slate-400 font-orbitron">Final Score</p>
            <p className="font-mono text-6xl font-black text-white">{score.points.toLocaleString()}</p>
        </div>
        <div className="space-y-2">
            <StatItem label={Judgement.Perfect} value={score.judgements[Judgement.Perfect]} color={JUDGEMENT_COLORS.Perfect} />
            <StatItem label={Judgement.Great} value={score.judgements[Judgement.Great]} color={JUDGEMENT_COLORS.Great} />
            <StatItem label={Judgement.Good} value={score.judgements[Judgement.Good]} color={JUDGEMENT_COLORS.Good} />
            <StatItem label={Judgement.Miss} value={score.judgements[Judgement.Miss]} color={JUDGEMENT_COLORS.Miss} />
            <StatItem label="Max Combo" value={score.maxCombo} color="text-orange-400" />
        </div>
      </div>

      <button
        onClick={onRestart}
        className="bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold font-orbitron py-3 px-8 rounded-lg hover:from-green-400 hover:to-teal-400 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-teal-500/30 flex items-center justify-center"
      >
        <RefreshCw className="mr-2 h-5 w-5" />
        Play Again
      </button>
    </div>
  );
};

export default ResultsScreen;
