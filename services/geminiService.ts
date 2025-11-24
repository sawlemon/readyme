import { GoogleGenAI, Type } from "@google/genai";
import { Question, QuizConfig } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateQuiz = async (config: QuizConfig): Promise<Question[]> => {
  // STRICTLY use gemini-3-pro-preview for all generation as requested.
  const modelId = 'gemini-3-pro-preview';

  let prompt = `You are a professional certification exam creator. Create a multiple choice quiz with EXACTLY ${config.questionCount} questions. This is a strict numerical requirement.`;
  
  if (config.topic && config.topic.trim().length > 0) {
    prompt += ` The topic is: "${config.topic}".`;
  }
  
  // Handle File Context
  if (config.fileData) {
    if (config.mimeType === 'application/pdf') {
       prompt += ` Use the attached PDF document as the primary source material. Analyze it deeply.`;
    } else {
       // Text-based files (txt, md) are appended to the prompt for best analysis
       prompt += `\n\n--- SOURCE MATERIAL BEGINS ---\n${config.fileData}\n--- SOURCE MATERIAL ENDS ---\n\nUse the source material above to generate the questions.`;
    }
  }

  prompt += `
    Requirements:
    1. Questions must be relevant to the topic/material.
    2. Vary difficulty (Easy, Medium, Hard).
    3. Each question must have EXACTLY 4 options.
    4. Provide a detailed, educational explanation for the correct answer.
    5. Output must be valid JSON matching the schema.
  `;

  const parts: any[] = [{ text: prompt }];

  // Only attach inlineData for PDF. Text/MD is already in prompt.
  if (config.fileData && config.mimeType === 'application/pdf') {
    parts.push({
      inlineData: {
        data: config.fileData,
        mimeType: config.mimeType,
      },
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
        // Double check count, though the prompt implies strictness, the model might deviate slightly. 
        // We accept what we get, but ideally it matches.
        return questions;
    }
  } catch (e) {
      console.error("Gemini Generation Error:", e);
      throw new Error("Failed to generate quiz. Please check your inputs and try again.");
  }

  throw new Error("No response from AI.");
};