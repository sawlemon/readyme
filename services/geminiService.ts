import { GoogleGenAI, Type } from "@google/genai";
import { Question, QuizConfig } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateQuiz = async (config: QuizConfig): Promise<Question[]> => {
  // STRICTLY use gemini-3-pro-preview for all generation as requested.
  // This ensures high-quality analysis of both text inputs and PDFs.
  const modelId = 'gemini-3-pro-preview';

  let prompt = `Create a professional certification-style multiple choice quiz with EXACTLY ${config.questionCount} questions. This is a strict requirement.`;
  
  if (config.topic && config.topic.trim().length > 0) {
    prompt += ` The topic is: "${config.topic}".`;
  }
  
  if (config.fileData) {
    prompt += ` Use the attached document as the primary source material for the questions. Analyze the document deeply to create high-quality, relevant questions.`;
  }

  prompt += `
    Ensure the questions vary in difficulty and cover different aspects of the subject. 
    Each question must have exactly 4 options.
    Provide a clear, educational explanation for the correct answer.
    Return strictly JSON.
  `;

  const parts: any[] = [{ text: prompt }];

  if (config.fileData && config.mimeType) {
    parts.push({
      inlineData: {
        data: config.fileData,
        mimeType: config.mimeType,
      },
    });
  }

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
    try {
      const questions = JSON.parse(response.text) as Question[];
      return questions;
    } catch (e) {
      console.error("Failed to parse Gemini response", e);
      throw new Error("Failed to generate valid quiz data.");
    }
  }

  throw new Error("No response from AI.");
};