export const config = { runtime: 'edge' };

export default async function handler() {
  const envCheck = {
    // Check our specific variable
    OPEN_API_KEY_exists: !!process.env.OPEN_API_KEY,
    OPEN_API_KEY_length: process.env.OPEN_API_KEY ? process.env.OPEN_API_KEY.length : 0,
    OPEN_API_KEY_preview: process.env.OPEN_API_KEY ? 
      process.env.OPEN_API_KEY.substring(0, 10) + '...' : 'NOT SET',
    
    // Check for common variations
    OPENAI_API_KEY_exists: !!process.env.OPENAI_API_KEY,
    OPEN_AI_KEY_exists: !!process.env.OPEN_AI_KEY,
    
    // List all env vars
    all_env_vars: Object.keys(process.env).sort(),
    
    timestamp: new Date().toISOString(),
    note: 'If OPEN_API_KEY_length is 0, the env var is not set'
  };

  return new Response(
    JSON.stringify(envCheck, null, 2),
    { 
      status: 200, 
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      } 
    }
  );
}