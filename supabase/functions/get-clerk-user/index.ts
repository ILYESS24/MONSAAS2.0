// Edge Function to retrieve Clerk user via Pica Passthrough
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    // Verify environment variables
    const PICA_SECRET_KEY = Deno.env.get('PICA_SECRET_KEY');
    const PICA_CLERK_CONNECTION_KEY = Deno.env.get('PICA_CLERK_CONNECTION_KEY');
    const PICA_ACTION_ID = 'conn_mod_def::GCT_31Q-7fo::pym2V-IETdaZ-7BJwSQTSA';

    if (!PICA_SECRET_KEY || !PICA_CLERK_CONNECTION_KEY) {
      return new Response(
        JSON.stringify({
          error: 'Missing Pica connection environment variables. Ensure PICA_SECRET_KEY and PICA_CLERK_CONNECTION_KEY are set.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // Parse request body
    const { user_id } = await req.json();

    if (!user_id || typeof user_id !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing required parameter: user_id' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Build Passthrough URL (encode path variable)
    const encodedUserId = encodeURIComponent(user_id);
    const url = `https://api.picaos.com/v1/passthrough/users/${encodedUserId}`;

    // Headers required by Pica Passthrough
    const headers = {
      'x-pica-secret': PICA_SECRET_KEY,
      'x-pica-connection-key': PICA_CLERK_CONNECTION_KEY,
      'x-pica-action-id': PICA_ACTION_ID,
      'Accept': 'application/json',
    };

    // Make the request to Pica Passthrough
    const response = await fetch(url, { method: 'GET', headers });

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    const status = response.status;
    const body = isJson ? await response.json() : await response.text();

    // Return the response
    return new Response(
      JSON.stringify(body),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status,
      }
    );
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
