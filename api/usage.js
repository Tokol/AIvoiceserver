export const config = { runtime: 'edge' };

// Simple in-memory store (resets on cold start)
let usageStats = {
  total_requests: 0,
  by_client: {},
  last_reset: new Date().toISOString(),
};

export default async function handler(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({
        success: true,
        stats: usageStats,
        note: 'Stats reset on server cold start',
      }),
      { status: 200, headers: corsHeaders }
    );
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const { client_id = 'anonymous' } = body;

      // Update stats
      usageStats.total_requests++;
      
      if (!usageStats.by_client[client_id]) {
        usageStats.by_client[client_id] = 0;
      }
      usageStats.by_client[client_id]++;

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Usage recorded',
          client_id,
          total_requests: usageStats.total_requests,
        }),
        { status: 200, headers: corsHeaders }
      );
    } catch (e) {
      return new Response(
        JSON.stringify({ success: false, error: e.message }),
        { status: 400, headers: corsHeaders }
      );
    }
  }

  return new Response(
    JSON.stringify({ success: false, error: 'Method not allowed' }),
    { status: 405, headers: corsHeaders }
  );
}