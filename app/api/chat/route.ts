import { openai } from '@ai-sdk/openai';
import { streamText, UIMessage, convertToModelMessages, tool } from 'ai';
import z from 'zod';

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
  console.log('🚀 ===== CHAT API CALLED =====');
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
  console.log('📨 Total messages:', messages.length);
  console.log('💬 Last user message:', messages[messages.length - 1]?.parts?.[0]?.text || 'N/A');

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
    tools: {
      'movie-studio-assistant': tool({
        description: 'Do production assistant operations like budget queries, scheduling conflicts, and project info lookups.',
        inputSchema: z.object({
          location: z.string().describe('The movie project data'),
        }),
        execute: async ({ location }) => {
          console.log('🔧 TOOL CALLED: movie-studio-assistant');
          console.log('📍 Input location:', location);
          const csvData = await loadCsv();
          console.log('✅ CSV data loaded, length:', csvData.length);

          return {
            location,
            csvData,
          };
        },
        onStepFinish: ({ toolCalls, toolResults }) => {
          console.log('🎯 ===== onStepFinish TRIGGERED =====');
          console.log('📊 Number of tool calls:', toolCalls.length);
          console.log('📦 Tool calls:', toolCalls);
          console.log('📦 Tool results:', toolResults);
          
          // Type-safe iteration
          for (const toolCall of toolCalls) {
            if (toolCall.dynamic) {
              // Dynamic tool: input is 'unknown'
              console.log('🔄 Dynamic tool:', toolCall.toolName, toolCall.input);
              continue;
            }
      
            // Static tool: full type inference
            console.log('⚙️ Static tool called:', toolCall.toolName);
            switch (toolCall.toolName) {
              case 'movie-studio-assistant':
                console.log('🎬 Movie studio location:', toolCall.input.location);
                break;
              case 'weather':
                console.log('🌤️ Weather location:', toolCall.input.location);
                break;
            }
          }
        },
      }),
    },
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
  console.log('✨ Returning streaming response...');
  return result.toUIMessageStreamResponse();
}

async function loadCsv() {
  const csv = await fetch('https://raw.githubusercontent.com/Omerisra6/editor-assistants-workshop/refs/heads/main/assitants/movie-studio/production-schedule.csv');
  const text = await csv.text();
  return text;
}
