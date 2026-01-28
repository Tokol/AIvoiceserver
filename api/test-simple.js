export const config = { runtime: "edge" };

export default async function handler() {
  return new Response(
    JSON.stringify({
      OPEN_API_KEY_exists: !!process.env.OPEN_API_KEY,
      OPEN_API_KEY_length: process.env.OPEN_API_KEY ? process.env.OPEN_API_KEY.length : 0,
      OPEN_API_KEY_prefix: process.env.OPEN_API_KEY ? process.env.OPEN_API_KEY.substring(0, 10) + "..." : "none",
      all_env_vars: Object.keys(process.env),
      timestamp: new Date().toISOString()
    }, null, 2),
    { 
      status: 200, 
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      } 
    }
  );
}
