import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const summarizeConversation = async (messages) => {
  try {
    const conversationText = messages.map(m =>
      `${m.sender.name}: ${m.content.text}`
    ).join('\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes conversations concisely. Keep summaries under 100 words.'
        },
        {
          role: 'user',
          content: `Summarize this conversation:\n\n${conversationText}`
        }
      ],
      max_tokens: 150,
      temperature: 0.5
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('AI summarization error:', error);
    return null;
  }
};

export const generateSmartReplies = async (messageText) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Generate 3 short, natural reply suggestions for the given message. Each reply should be under 10 words. Return only the replies, separated by |'
        },
        {
          role: 'user',
          content: messageText
        }
      ],
      max_tokens: 100,
      temperature: 0.7
    });

    const replies = response.choices[0].message.content.split('|').map(r => r.trim());
    return replies.slice(0, 3);
  } catch (error) {
    console.error('AI smart replies error:', error);
    return [];
  }
};

export const detectMessageIntent = async (messageText) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Analyze the message and detect if it contains:
- meeting (schedule/arrange a meeting)
- reminder (something to remember)
- task (action item/todo)
- question (asking something)
- casual (general chat)

Return ONLY the category name and any extracted data in JSON format:
{"intent": "category", "date": "YYYY-MM-DD", "time": "HH:MM", "action": "description"}`
        },
        {
          role: 'user',
          content: messageText
        }
      ],
      max_tokens: 150,
      temperature: 0.3
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('AI intent detection error:', error);
    return { intent: 'casual' };
  }
};

export const transcribeVoice = async (audioUrl) => {
  try {
    // This would require downloading the audio file first
    // For now, returning a placeholder
    // In production, you'd use OpenAI's Whisper API
    return 'Voice transcription feature - integrate Whisper API';
  } catch (error) {
    console.error('Voice transcription error:', error);
    return null;
  }
};

export const detectImportantMessage = async (messageText) => {
  try {
    const keywords = ['important', 'urgent', 'asap', 'deadline', 'meeting', 'reminder', 'don\'t forget'];
    const lowerText = messageText.toLowerCase();

    // Simple keyword-based detection
    const hasKeyword = keywords.some(keyword => lowerText.includes(keyword));

    if (hasKeyword) return true;

    // For more advanced detection, use AI
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Determine if this message is important or urgent. Answer only "yes" or "no".'
        },
        {
          role: 'user',
          content: messageText
        }
      ],
      max_tokens: 5,
      temperature: 0.3
    });

    return response.choices[0].message.content.toLowerCase().includes('yes');
  } catch (error) {
    console.error('AI importance detection error:', error);
    return false;
  }
};
