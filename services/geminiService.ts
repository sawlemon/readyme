import { GoogleGenAI, Type } from "@google/genai";
import { Question, QuizConfig } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateQuiz = async (config: QuizConfig): Promise<Question[]> => {
  // STRICTLY use gemini-3-pro-preview for all generation as requested.
  const modelId = 'gemini-3-pro-preview';

  let prompt = `You are a professional certification exam creator. Create a multiple choice quiz with EXACTLY ${config.questionCount} questions. This is a strict numerical requirement.`;
  
  if (config.topic && config.topic.trim().length > 0) {
    prompt += `\n\nContext/Topic Description: "${config.topic}". Use this to guide the questions generated from any provided source materials below (if any), or as the primary topic if no files are provided.`;
  }
  
  // Handle Files Context
  if (config.files && config.files.length > 0) {
    prompt += `\n\nAnalyze the following source materials deeply to generate the questions:`;
    
    // Append text-based file contents directly to prompt
    config.files.forEach((file, index) => {
        if (file.mimeType !== 'application/pdf') {
             prompt += `\n\n--- SOURCE MATERIAL ${index + 1} (${file.name}) ---\n${file.data}\n--- END SOURCE MATERIAL ---\n`;
        }
    });
  }

  prompt += `
    Requirements:
    1. Questions must be relevant to the topic/material.
    2. Difficulty Level: ${config.difficulty}. Ensure the complexity, depth, and nuance of the questions and options strictly match this difficulty level.
    3. Each question must have EXACTLY 4 options.
    4. Provide a detailed, educational explanation for the correct answer.
    5. Output must be valid JSON matching the schema.
  `;

  const parts: any[] = [{ text: prompt }];

  // Attach inlineData for PDFs
  if (config.files) {
    config.files.forEach(file => {
        if (file.mimeType === 'application/pdf') {
            parts.push({
                inlineData: {
                    data: file.data,
                    mimeType: file.mimeType,
                },
            });
        }
    });
  }

  try {
    const response = await ai.models.generateContent({
        model: modelId,
        contents: {
        parts: parts
        },
        config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: {
            type: Type.OBJECT,
            properties: {
                question: { type: Type.STRING },
                options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Must contain exactly 4 options"
                },
                correctIndex: { type: Type.INTEGER, description: "0-based index of the correct option" },
                explanation: { type: Type.STRING }
            },
            required: ["question", "options", "correctIndex", "explanation"],
            },
        },
        },
    });

    if (response.text) {
        const questions = JSON.parse(response.text) as Question[];
        return questions;
    }
  } catch (e) {
      console.error("Gemini Generation Error:", e);
      throw new Error("Failed to generate quiz. Please check your inputs and try again.");
  }

  throw new Error("No response from AI.");
};