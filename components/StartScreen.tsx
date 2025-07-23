
import React, { useState } from 'react';
import { Sparkles, Music4 } from 'lucide-react';

interface StartScreenProps {
  onStart: (prompt: string) => void;
  error: string | null;
}

const examplePrompts = [
    "High-energy 8-bit chiptune for a retro arcade game",
    "Calm, flowing piano melody for a relaxing evening",
    "Intense, fast-paced electronic drum and bass track",
    "Funky disco beat with a prominent bassline",
];

const StartScreen: React.FC<StartScreenProps> = ({ onStart, error }) => {
  const [prompt, setPrompt] = useState(examplePrompts[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onStart(prompt.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gradient-to-b from-slate-900 to-purple-900/50">
      <h1 className="text-5xl font-black font-orbitron tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-300 mb-4">
        Gemini Rhythm
      </h1>
      <p className="text-slate-300 mb-8 max-w-md">
        Describe a song or musical style, and let AI generate a playable rhythm game for you.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="mb-4">
            <label htmlFor="prompt" className="block text-left text-slate-400 mb-2 font-semibold">Describe your music:</label>
            <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-24 p-3 bg-slate-800 border-2 border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all resize-none"
                placeholder="e.g., A fast-paced rock song with epic guitar solos"
            />
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6">
            {examplePrompts.map((p, i) => (
                <button
                    type="button"
                    key={i}
                    onClick={() => setPrompt(p)}
                    className="text-xs text-left p-2 bg-slate-800/50 hover:bg-slate-700 rounded-md transition-colors text-slate-400"
                >
                    {p}
                </button>
            ))}
        </div>
        
        {error && <p className="text-red-400 mb-4">{error}</p>}
        
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold font-orbitron py-3 px-6 rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/30 flex items-center justify-center"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Generate & Play
        </button>
      </form>
    </div>
  );
};

export default StartScreen;
