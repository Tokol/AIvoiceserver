export const config = { runtime: 'edge' };

export default async function handler(req) {
  const data = {
    status: 'healthy',
    service: 'OpenAI Voice API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      token: {
        method: 'POST',
        url: '/api/token',
        body: {
          instructions: 'string (required)',
          voice: 'string (optional, default: alloy)',
          model: 'string (optional, default: gpt-realtime)',
          client_id: 'string (optional)'
        }
      }
    },
    supported_voices: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
    usage: 'Generate ephemeral tokens for OpenAI Realtime API',
    repository: 'https://github.com/YOUR_USERNAME/openai-voice-api',
  };

  return new Response(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
    },
  });
}