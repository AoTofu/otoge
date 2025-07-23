
import { GoogleGenAI, Type } from "@google/genai";
import { Beatmap } from '../types';
import { LANE_COUNT, GAME_DURATION_MS } from '../constants';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.ARRAY,
    description: `An array of notes for a rhythm game beatmap. The song is ${GAME_DURATION_MS / 1000} seconds long. Generate a variety of rhythms, including some faster sections.`,
    items: {
      type: Type.OBJECT,
      properties: {
        time: {
          type: Type.INTEGER,
          description: `The time in milliseconds from the start of the song when the note should be hit. Must be between 0 and ${GAME_DURATION_MS}.`
        },
        lane: {
          type: Type.INTEGER,
          description: `The lane the note falls in, from 0 to ${LANE_COUNT - 1}.`
        }
      },
      required: ['time', 'lane']
    }
};


export const generateBeatmap = async (prompt: string): Promise<Beatmap> => {
  const fullPrompt = `Based on the following description, generate a fun and playable rhythm game beatmap. Description: "${prompt}"`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: fullPrompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
    },
  });

  const text = response.text.trim();
  const parsedJson = JSON.parse(text);

  if (!Array.isArray(parsedJson)) {
    throw new Error("API did not return a valid beatmap array.");
  }

  // Add a unique ID to each note
  return parsedJson.map((note, index) => ({
      ...note,
      id: `${note.time}-${note.lane}-${index}`,
      judged: false,
  }));
};
