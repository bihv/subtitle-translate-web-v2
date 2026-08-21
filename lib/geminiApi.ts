"use client";

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { RateLimiter } from "@/lib/rateLimiter";

// Create a global rate limiter instance with 2s delay and 3 retries
const rateLimiter = new RateLimiter(2000, 3, 2);

// Biến lưu trữ API key hiện tại
let currentApiKey = "";

// Biến lưu trữ model hiện tại
let currentModel = "gemma-4-31b-it"; // Default model

/**
 * Cập nhật API key mới
 * @param apiKey API key mới
 */
export function setApiKey(apiKey: string) {
  currentApiKey = apiKey;
}

/**
 * Lấy API key hiện tại
 * @returns API key hiện tại
 */
export function getApiKey(): string {
  return currentApiKey;
}

/**
 * Cập nhật model mới
 * @param model Model ID mới
 */
export function setModel(model: string) {
  currentModel = model;
}

/**
 * Lấy model hiện tại
 * @returns Model ID hiện tại
 */
export function getModel(): string {
  return currentModel;
}

// Initialize Gemini API
const getGeminiClient = () => {
  // Ưu tiên sử dụng API key do người dùng cung cấp
  const apiKey = currentApiKey;
    
  if (!apiKey) {
    throw new Error("Missing Gemini API key. Please provide a valid API key.");
  }
  return new GoogleGenerativeAI(apiKey);
};

export interface TranslationResult {
  text: string;
  error?: string;
}

export interface TranslateOptions {
  texts: string[];
  targetLanguage: string;
  prompt: string;
  context?: string;
  model?: string; // Model ID có thể được chỉ định từ bên ngoài
}

/**
 * Translate an array of texts using the Gemini API
 * Supports batch processing of multiple texts in an efficient way
 */
export async function translateWithGemini({
  texts,
  targetLanguage,
  prompt,
  context = "",
  model
}: TranslateOptions): Promise<TranslationResult[]> {
  try {
    // Kiểm tra xem API key đã được cung cấp chưa
    if (!currentApiKey) {
      throw new Error("API key is required. Please provide a valid Gemini API key.");
    }
    
    // Use the rate limiter to execute the API call
    return await rateLimiter.execute(async () => {
      const genAI = getGeminiClient();
      // Sử dụng model được chỉ định từ bên ngoài hoặc model mặc định
      const modelToUse = model || currentModel;
      const modelInstance = genAI.getGenerativeModel({ model: modelToUse });

      // Safety settings
      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ];

      // Phương pháp 1: Nếu có nhiều câu trong batch, nhưng số lượng vừa phải (2-5 câu),
      // sử dụng tính năng đa prompt của Gemini
      if (texts.length > 1 && texts.length <= 5) {
        try {
          // Tính năng đa prompt chính thức của Gemini. 
          // Điều này sẽ gửi 1 request duy nhất với nhiều prompt khác nhau
          const formattedPrompts = texts.map(text => ({
            role: "user",
            parts: [{ text: `${prompt}\n${context ? context + "\n\n" : ""}Translate this subtitle to ${targetLanguage}:\n"${text}"` }]
          }));
          
          // Gọi API với nhiều prompt (nhiều câu hỏi) trong một request
          const result = await modelInstance.generateContentStream({ 
            contents: formattedPrompts,
            safetySettings,
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 8192,
            }
          });
          
          // Xử lý kết quả
          const translatedTexts: TranslationResult[] = Array(texts.length).fill({ text: "", error: "No result" });
          let responseIndex = 0;
          
          for await (const chunk of result.stream) {
            if (chunk.candidates?.[0]?.content?.parts?.[0]?.text && responseIndex < translatedTexts.length) {
              translatedTexts[responseIndex] = { text: chunk.candidates[0].content.parts[0].text.trim() };
              responseIndex++;
            }
          }
          
          // Nếu đã xử lý thành công ít nhất một câu, trả về kết quả
          if (responseIndex > 0) {
            return translatedTexts;
          }
          
          // Nếu không thành công, thử phương pháp gửi nhiều request riêng biệt
          console.log("Stream approach failed, trying multiple separate requests...");
        } catch (streamError) {
          console.warn("Stream approach failed, trying multiple separate requests:", streamError);
        }
        
        try {
          // Backup: Phương pháp gửi nhiều request riêng biệt
          // Tạo các prompt riêng biệt cho mỗi câu
          const prompts = texts.map(text => 
            `${prompt}\n${context ? context + "\n\n" : ""}Translate this subtitle to ${targetLanguage}:\n"${text}"`
          );

          // Gọi API riêng cho từng prompt và kết hợp kết quả
          const translationPromises = prompts.map(promptText => 
            modelInstance.generateContent({
              contents: [{ role: "user", parts: [{ text: promptText }] }],
              safetySettings,
              generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 2048,
              },
            })
          );
          
          // Chờ tất cả các request hoàn thành
          const results = await Promise.all(translationPromises);
          
          // Xử lý kết quả
          const translatedTexts: TranslationResult[] = results.map(result => {
            try {
              const responseText = result.response.text();
              return { text: responseText.trim() };
            } catch (error) {
              return { 
                text: "", 
                error: error instanceof Error ? error.message : "Failed to extract translation" 
              };
            }
          });
          
          return translatedTexts;
        } catch (multiPromptError) {
          console.warn("Multiple separate API calls approach failed, falling back to single prompt approach:", multiPromptError);
          // Fall back to the original approach if multiple calls fail
        }
      }

      // Phương pháp 2 (thường dùng cho batch lớn): Gửi tất cả câu trong một prompt với định dạng JSON
      // Phương pháp này hoạt động tốt với số lượng câu lớn (lên đến 30-50 câu trong một lần gọi)
      const promptTemplate = `${prompt}

${context ? context + "\n\n" : ""}I need you to translate the following subtitles to ${targetLanguage}.
Please maintain the original meaning, tone, style, and nuances.
Respond in a JSON format with an array of translated texts.

For example:
Input: ["Hello, how are you?", "I'm fine, thank you."]
Output: { "translations": ["Xin chào, bạn khỏe không?", "Tôi khỏe, cảm ơn bạn."] }

Here are the texts to translate:
${JSON.stringify(texts)}`;

      // Call the Gemini API
      const result = await modelInstance.generateContent({
        contents: [{ role: "user", parts: [{ text: promptTemplate }] }],
        safetySettings,
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 8192,
        },
      });

      const responseText = result.response.text();
      
      // Parse the JSON response
      try {
        // Extract JSON from the response (handling potential text before/after the JSON)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
          // If no JSON found, try to parse lines directly
          const lines = responseText.split("\n").filter(line => line.trim());
          const translations = lines.map(line => {
            // Remove any numbering, quotes, etc.
            return line.replace(/^\d+[\.\)]?\s*["']?|["']?\s*$/, "").trim();
          });
          
          // Make sure we have the right number of translations
          return texts.map((_, index) => ({
            text: translations[index] || `[Error: Failed to extract translation ${index + 1}]`
          }));
        }
        
        const jsonStr = jsonMatch[0];
        const parsed = JSON.parse(jsonStr);
        
        // Check if the response has the expected format
        if (Array.isArray(parsed.translations)) {
          return parsed.translations.map((text: string) => ({ text }));
        } else if (parsed.translations) {
          // Handle unexpected format but still has translations field
          return texts.map((_, index) => ({
            text: String(parsed.translations[index] || "")
          }));
        } else {
          // Fall back to using any array in the response
          const firstArrayField = Object.values(parsed).find(value => Array.isArray(value));
          
          if (firstArrayField) {
            return (firstArrayField as string[]).map(text => ({ text }));
          } else {
            throw new Error("Response doesn't contain translations in expected format");
          }
        }
      } catch (parseError) {
        console.error("Error parsing API response:", parseError);
        
        // Split by new lines as fallback
        const lines = responseText
          .split("\n")
          .filter(line => line.trim())
          .map(line => line.replace(/^\d+[\.\)]?\s*["']?|["']?\s*$/, "").trim());
        
        return texts.map((_, index) => ({
          text: lines[index] || `[Error: Failed to parse response for item ${index + 1}]`
        }));
      }
    });
  } catch (error) {
    console.error("Gemini API error:", error);
    return texts.map(() => ({
      text: "",
      error: error instanceof Error ? error.message : "Unknown error occurred"
    }));
  }
} 