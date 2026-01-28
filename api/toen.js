export const config = {
  runtime: 'edge',
  maxDuration: 10,
};

export default async function handler(req) {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-ID',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Method not allowed. Use POST.' 
      }),
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Server configuration error' 
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid JSON body' 
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate required fields
    const { instructions, client_id } = body;
    
    if (!instructions || typeof instructions !== 'string') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing or invalid "instructions" field' 
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Optional fields with defaults
    const voice = body.voice || 'alloy'; // alloy, echo, fable, onyx, nova, shimmer
    const model = body.model || 'gpt-realtime';
    const temperature = body.temperature || 0.7;

    // Log request (optional)
    console.log(`Token request from: ${client_id || 'unknown'} | Voice: ${voice}`);

    // Generate OpenAI ephemeral token
    const response = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session: {
          type: 'realtime',
          model: model,
          voice: voice,
          temperature: temperature,
          modalities: ['text', 'audio'],
          instructions: instructions,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to generate token',
          details: errorText.substring(0, 200)
        }),
        { status: response.status, headers: corsHeaders }
      );
    }

    const data = await response.json();

    // Success response
    return new Response(
      JSON.stringify({
        success: true,
        token: data.value,
        expires_in: data.expires_in || 3600,
        model: model,
        voice: voice,
        generated_at: new Date().toISOString(),
        metadata: {
          client_id: client_id,
          instructions_length: instructions.length,
        }
      }),
      { 
        status: 200, 
        headers: corsHeaders 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: error.message,
      }),
      { 
        status: 500, 
        headers: corsHeaders 
      }
    );
  }
}