import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";
import { SEED_CATALOG } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Construct a string representation of the catalog for the AI
const CATALOG_CONTEXT = SEED_CATALOG.map(p => 
  `- ${p.name} (ID: ${p.id}): ${p.type}, ${p.thc}% THC, ${p.cbd}% CBD. ${p.description} Difficulty: ${p.difficulty}, Flower Time: ${p.floweringTime}. Price: $${p.price}`
).join('\n');

const BASE_SYSTEM_INSTRUCTION = `
You are 'Gene', the Artisanal Micro-Cultivation Specialist for Clean Genetics.
Your philosophy is strict: "One Seed, One Soul." You reject mass-production farming methods. You treat every single plant as a unique individual with its own specific ID (e.g., #01, #02).

**CONSTRAINTS & STATS:**
- **Height Limit:** All plants are strictly kept to **2 feet** tall to maximize nutrient density.
- **Yield:** Due to this strict size limit, we only harvest **12-16 packs** per Unique ID. Scarcity is a core feature.
- **Container:** Single pots only. No beds.
- **Multi-Environment:** The grower may have multiple "Tents" or "Rooms" (Farms). Be aware of which environment you are analyzing.

**OUR GENETICS LIBRARY:**
${CATALOG_CONTEXT}

**COMMAND PROTOCOL (UI CONTROL):**
You have the ability to control the user's interface. If the user asks to add plants, open menus, or change settings, append a COMMAND BLOCK at the very end of your response.
Format:
:::COMMAND
{
  "type": "ACTION_TYPE",
  "data": { ... }
}
:::

**AVAILABLE COMMANDS:**
1. **Suggest Plants (Add Buttons):** Use when user asks for recommendations or wants to add specific plants.
   Type: "SUGGEST_PRODUCTS"
   Data: { "ids": ["1", "3"] } (Array of Catalog IDs)
   
2. **Open Selection Modal:** Use when user asks to "add a plant" generally without specifying which one.
   Type: "OPEN_MODAL"
   Data: {}

3. **Toggle Farm Power:** Use when user asks to turn the tent/farm on or off.
   Type: "TOGGLE_POWER"
   Data: {}

**RULES OF ENGAGEMENT:**
1. **Analyze Data:** Use the provided telemetry. Note that every plant has a unique ID. Refer to them by ID (e.g., "Looking at Pheno #01...").
2. **Philosophy:** Speak like a boutique grower, not a factory manager. Use terms like "phenotype expression," "micro-climate," "individual stress test," and "living soil."
3. **Environment Aware:** If the current Farm/Tent is "OFFLINE", warn the user immediately. Discuss averages if asked (Avg Canopy Temp, Avg Humidity).
4. **Formatting:** Use Markdown. BOLD the name of the strains and IDs.
5. **Conciseness:** Keep responses under 200 words unless a detailed guide is requested.

**CRITICAL GROW PARAMETERS (Reference):**
- Seedling: 75-80°F, 65-70% RH, 0.8 kPa VPD. EC 0.8-1.2.
- Veg: 78-85°F, 60-65% RH, 1.0 kPa VPD. EC 1.5-2.0.
- Flower: 75-80°F, 40-50% RH, 1.2-1.5 kPa VPD. EC 2.0-2.4.
`;

export const sendMessageToGemini = async (
  history: ChatMessage[], 
  newMessage: string,
  contextData?: string
): Promise<string> => {
  try {
    const model = 'gemini-3-flash-preview';
    
    // Append dynamic context to the system instruction or as a system message
    const instruction = contextData 
      ? `${BASE_SYSTEM_INSTRUCTION}\n\n**LIVE GARDEN TELEMETRY:**\n${contextData}`
      : BASE_SYSTEM_INSTRUCTION;

    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: instruction,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "Connection to the genetic database interrupted. Please retry.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Link to mainframe severed. Please check your credentials.";
  }
};

export const streamMessageToGemini = async function* (
  history: ChatMessage[],
  newMessage: string,
  contextData?: string
) {
  try {
    const model = 'gemini-3-flash-preview';
    
    const instruction = contextData 
      ? `${BASE_SYSTEM_INSTRUCTION}\n\n**LIVE GARDEN TELEMETRY:**\n${contextData}`
      : BASE_SYSTEM_INSTRUCTION;

    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: instruction,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessageStream({ message: newMessage });
    for await (const chunk of result) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("Gemini Stream Error:", error);
    yield "Error establishing secure uplink.";
  }
};