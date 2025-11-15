import { GoogleGenAI, Chat, GenerateContentResponse, LatLng, Modality } from "@google/genai";

let chatInstance: Chat | null = null; // Renamed to avoid confusion with the fresh AI instance below

const createFreshAiInstance = (): GoogleGenAI => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable for Gemini not set. Please set it to use Gemini features.");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const getChatInstance = (): Chat => {
    // If we need chat history, the chat object itself should be a singleton per conversation.
    // The underlying GoogleGenAI instance it uses can be fresh.
    if (!chatInstance) {
        const genAI = createFreshAiInstance(); // Create a fresh AI instance for the chat
        chatInstance = genAI.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: 'Você é um assistente prestativo para a plataforma de caronas Goly. Seja conciso e profissional.',
            },
        });
    }
    return chatInstance;
};

export const getChatbotResponse = async (message: string): Promise<GenerateContentResponse> => {
    const chat = getChatInstance(); // Use the chat singleton
    const result = await chat.sendMessage({ message });
    return result;
};

export const getGroundedResponse = async (message: string, location: { latitude: number; longitude: number }): Promise<GenerateContentResponse> => {
    const genAI = createFreshAiInstance(); // Always create a fresh AI instance for non-chat calls
    return await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: message,
        config: {
            tools: [{ googleMaps: {} }],
            toolConfig: {
                retrievalConfig: {
                    latLng: location as LatLng,
                },
            },
        },
    });
};

export const getTextToSpeech = async (text: string): Promise<string | null> => {
    try {
        const genAI = createFreshAiInstance(); // Always create a fresh AI instance
        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error("TTS generation failed:", error);
        return null;
    }
};