import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import {
  convertToModelMessages,
  extractReasoningMiddleware,
  smoothStream,
  streamText,
  UIMessage,
  wrapLanguageModel,
} from "ai";

import { env } from "@/lib/env";
import type { Model } from "@/types/model";

import { newsTool } from "../tools/news";
import { weatherTool } from "../tools/weather";
import { errorHandler } from "../utils/error-handler";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const compatibleAi = createOpenAICompatible({
  name: "qwen/qwen3-4b-thinking-2507",
  baseURL: env.LM_STUDIO_URL,
});

type CreateStreamTextParams = {
  messages: UIMessage[];
  modelId: Model["id"];
};

export async function createStreamText({
  messages,
  modelId,
}: CreateStreamTextParams) {
  const getModel = () => {
    if (modelId === "qwen/qwen3-4b-thinking-2507") {
      return compatibleAi(modelId);
    }
    return google(modelId);
  };

  const model = wrapLanguageModel({
    model: getModel(),
    middleware: [extractReasoningMiddleware({ tagName: "think" })],
  });

  try {
    let errorMessage: string | null = null;

    const streamResult = streamText({
      model,
      temperature: 0.8,
      messages: await convertToModelMessages(messages),
      experimental_transform: [
        smoothStream({
          chunking: "line",
          delayInMs: 100,
        }),
      ],
      toolChoice: "auto",
      tools: {
        getWeather: weatherTool,
        getNews: newsTool,
      },
      onError: (error) => {
        errorMessage = errorHandler(error);
      },
    });

    if (!streamResult) {
      return {
        streamResult: null,
        streamError: errorMessage,
      };
    }

    return {
      streamResult,
      streamError: null,
    };
  } catch (error) {
    return {
      streamResult: null,
      streamError: errorHandler(error),
    };
  }
}
