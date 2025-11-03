import { openai } from '@ai-sdk/openai';
import { streamText, UIMessage, convertToModelMessages } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

/**
 * Asynchronous POST request handler for the chat endpoint.
 * 
 * This function handles incoming chat requests from the frontend, processes
 * the conversation history, and streams AI-generated responses back to the client.
 * 
 * @param req - The incoming Request object containing the chat messages
 * @returns A streaming response with the AI-generated message
 */
export async function POST(req: Request) {
  // Extract messages from the request body
  // The messages variable contains the entire conversation history between
  // the user and the chatbot. Each message is of type UIMessage, which includes:
  // - id: Unique identifier for the message
  // - role: 'system' | 'user' | 'assistant'
  // - parts: Array of message parts (text, files, tool calls, etc.)
  // - metadata: Additional data like timestamps, custom properties
  // 
  // This conversation history provides the chatbot with the necessary context
  // to generate contextually relevant responses.
  const { messages }: { messages: UIMessage[] } = await req.json();

  // Convert UIMessages to ModelMessages
  // UIMessage[] contains UI-specific metadata (timestamps, sender info, parts structure)
  // ModelMessage[] is the format expected by AI models (stripped of UI metadata)
  // The convertToModelMessages function transforms UIMessage[] to ModelMessage[]
  // by removing UI-specific data while preserving the core conversation content
  const modelMessages = convertToModelMessages(messages);

  // Call streamText to generate and stream the AI response
  // This function accepts a configuration object with:
  // - model: The AI model provider (imported from @ai-sdk/openai)
  // - messages: ModelMessage[] array (conversation history without UI metadata)
  // - system: Optional system prompt to customize the model's behavior
  // - Additional optional settings: temperature, maxTokens, topP, etc.
  // 
  // streamText returns a StreamTextResult object
  const result = streamText({
    model: openai('gpt-4o'), // Model provider from @ai-sdk/openai
    messages: modelMessages,  // ModelMessage[] array (not UIMessage[])
    system: 'You are a helpful AI assistant.', // Customize behavior
    // Additional optional settings can be added here:
    // temperature: 0.7,
    // maxTokens: 2000,
    // topP: 1,
  });

  // The StreamTextResult object contains several methods for handling the response:
  // - toUIMessageStreamResponse(): Converts to a streamed Response object optimized for UI
  // - toDataStreamResponse(): Converts to a data stream response
  // - toTextStreamResponse(): Converts to a plain text stream
  // - fullStream: Access to the underlying async iterable
  // 
  // toUIMessageStreamResponse() returns a Response object with:
  // - Streaming body containing UIMessage chunks
  // - Proper headers for streaming (Content-Type, Transfer-Encoding)
  // - Format compatible with @ai-sdk/react hooks (useChat)
  return result.toUIMessageStreamResponse();
}