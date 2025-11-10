import { GoogleGenAI, Chat, GenerateContentResponse, LatLng, Modality } from "@google/genai";

// FIX: API_KEY check should be at the top level
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable for Gemini not set. Please set it to use Gemini features.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
let chat: Chat | null = null;

const getChatInstance = (): Chat => {
    if (!chat) {
        chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: 'Você é um assistente prestativo para a plataforma de caronas Goly. Seja conciso e profissional.',
            },
        });
    }
    return chat;
};

export const getChatbotResponse = async (message: string): Promise<GenerateContentResponse> => {
    const chatInstance = getChatInstance();
    const result = await chatInstance.sendMessage({ message });
    return result;
};

export const getGroundedResponse = async (message: string, location: { latitude: number; longitude: number }): Promise<GenerateContentResponse> => {
    return await ai.models.generateContent({
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
        const response = await ai.models.generateContent({
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
