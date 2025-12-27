
import { GoogleGenAI, Type } from "@google/genai";
import { Topic, Article, Company } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const MODEL_NAME = 'gemini-3-flash-preview';

/**
 * Robust ID generation for articles using the URL.
 * Using the verbatim URL as the source for the ID ensures uniqueness and stability.
 */
function generateId(url: string): string {
  if (!url) return Math.random().toString(36).substring(7);
  try {
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  } catch (e) {
    return Math.random().toString(36).substring(7);
  }
}

/**
 * Fetches latest blogs from a specific company using Google Search grounding.
 * Strictly enforced to avoid URL hallucination.
 */
export async function fetchCompanyBlogs(company: Company, topic: Topic): Promise<Article[]> {
  const prompt = `SEARCH AND EXTRACT MISSION (Vertex-Grounded Accuracy): 
  Find the most recent blog posts from the official ${company.name} website (${company.blogUrl}) about "${topic}".

  STRICT URL INTEGRITY PROTOCOL:
  1. You MUST use the Google Search tool to find actual results.
  2. For the 'url' field in the JSON response, YOU MUST ONLY USE THE RAW, ABSOLUTE 'uri' AS IT APPEARS IN THE SEARCH GROUNDING METADATA.
  3. NEVER construct a URL by guessing the slug based on the title.
  4. NEVER simplify a URL (e.g., if it has a date like /2024/05/ or a complex report suffix like -2025-report/, YOU MUST INCLUDE IT).
  5. EVERY character in the URL must match the source search result exactly. NO HALLUCINATION.
  6. If you cannot find a direct link in the metadata, do not include the article.

  Return up to 5 results in valid JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: "You are a specialized data retrieval agent. Your primary directive is 100% URL ACCURACY via search grounding. You extract the exact absolute links from search results metadata. You are strictly forbidden from guessing, inventing, or reconstructing URLs. You must look at the 'uri' property and copy it verbatim. Accuracy is non-negotiable.",
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Verbatim title." },
              url: { type: Type.STRING, description: "The EXACT, RAW absolute URL from the grounding metadata." },
              summary: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "3-5 takeaways."
              },
              publishedDate: { type: Type.STRING, description: "Publication date." }
            },
            required: ["title", "url", "summary"]
          }
        }
      },
    });

    const results = JSON.parse(response.text || '[]');
    return results.map((r: any) => ({
      ...r,
      id: generateId(r.url),
      source: company.name,
      topic,
      isRead: false,
      isSaved: false
    }));
  } catch (error) {
    console.error("Error fetching company blogs:", error);
    return [];
  }
}

/**
 * Fetches general industry news for a specific topic across the web.
 * Uses strict URL extraction to ensure reliability.
 */
export async function fetchGlobalIndustryNews(topic: Topic): Promise<Article[]> {
  const prompt = `SEARCH TASK: Find high-authority global industry news for "${topic}".

  MANDATORY RULE:
  - Copy the ACTUAL source link from your search grounding results.
  - Do not reconstruct or guess links from the title. 
  - Absolute, verbatim character-perfect copy of the URL is required.

  Return 4 results in JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: "You are an expert news librarian. You prioritize link integrity above all else. You extract the full, raw absolute URL for every source from the search grounding verbatim. You never shorten, summarize, or hallucinate a link path.",
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              url: { type: Type.STRING, description: "Verbatim absolute URL from search results metadata." },
              source: { type: Type.STRING },
              summary: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              }
            },
            required: ["title", "url", "source", "summary"]
          }
        }
      },
    });

    const results = JSON.parse(response.text || '[]');
    return results.map((r: any) => ({
      ...r,
      id: generateId(r.url),
      topic,
      isRead: false,
      isSaved: false
    }));
  } catch (error) {
    console.error("Error fetching global news:", error);
    return [];
  }
}
