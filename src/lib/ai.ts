interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GenerateOptions {
  jsonMode?: boolean;
}

export async function generateCompletion(
  messages: ChatMessage[],
  options: GenerateOptions = {}
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!apiKey) {
    throw new Error(
      "Google Gemini API Key is missing. Please configure GEMINI_API_KEY in your .env.local file to activate the AI Chat Assistant."
    );
  }

  // Extract system prompt and convert messages to Gemini contents format
  const contents: any[] = [];
  let systemInstructionText: string | undefined = undefined;

  for (const msg of messages) {
    if (!msg.content || !msg.content.trim()) continue;

    if (msg.role === 'system') {
      systemInstructionText = systemInstructionText 
        ? `${systemInstructionText}\n${msg.content}` 
        : msg.content;
      continue;
    }

    const geminiRole = msg.role === 'assistant' ? 'model' : 'user';

    // Combine consecutive messages with the same role
    if (contents.length > 0 && contents[contents.length - 1].role === geminiRole) {
      contents[contents.length - 1].parts[0].text += `\n${msg.content}`;
    } else {
      contents.push({
        role: geminiRole,
        parts: [{ text: msg.content }]
      });
    }
  }

  // Gemini requires the first message in contents to be from 'user'
  if (contents.length > 0 && contents[0].role !== 'user') {
    contents.unshift({
      role: 'user',
      parts: [{ text: "Hello" }]
    });
  }

  if (contents.length === 0) {
    throw new Error("Cannot send an empty prompt to the AI model.");
  }

  // Construct request body
  const requestBody: any = {
    contents,
  };

  if (systemInstructionText) {
    requestBody.systemInstruction = {
      parts: [{ text: systemInstructionText }]
    };
  }

  if (options.jsonMode) {
    requestBody.generationConfig = {
      responseMimeType: "application/json"
    };
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = null;
      }

      const status = response.status;
      const errorMessage = errorData?.error?.message || "";

      if (status === 400 && errorMessage.toLowerCase().includes("key")) {
        throw new Error("The Google Gemini API Key provided is invalid. Please check your GEMINI_API_KEY configuration in your .env.local file.");
      } else if (status === 429) {
        throw new Error("Rate limit exceeded for Google Gemini API. Please wait a moment before trying again.");
      } else if (status === 403) {
        throw new Error("Access forbidden. Ensure Gemini API is enabled in your Google Cloud Project and the API key matches.");
      } else {
        throw new Error(`Gemini API Error (${status}): ${errorMessage || response.statusText}`);
      }
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!replyText) {
      throw new Error("Received an empty or unexpected response structure from the Gemini API.");
    }

    return replyText;
  } catch (error: any) {
    // If it's already one of our handled errors, rethrow it
    if (error.message.includes("API Key") || error.message.includes("Rate limit") || error.message.includes("Access forbidden")) {
      throw error;
    }
    
    // Otherwise, handle network level failures
    console.error("AI service layer error:", error);
    throw new Error(`Failed to communicate with AI provider: ${error.message || "Network connection failure"}`);
  }
}
