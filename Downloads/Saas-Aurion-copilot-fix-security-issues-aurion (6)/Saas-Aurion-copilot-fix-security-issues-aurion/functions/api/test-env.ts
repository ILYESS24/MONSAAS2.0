export async function onRequest(context) {
  const envVars = {
    STRIPE_SECRET_KEY: context.env.STRIPE_SECRET_KEY ? 'SET' : 'NOT SET',
    STRIPE_PUBLISHABLE_KEY: context.env.STRIPE_PUBLISHABLE_KEY ? 'SET' : 'NOT SET',
    SUPABASE_URL: context.env.SUPABASE_URL ? 'SET' : 'NOT SET',
    SUPABASE_SERVICE_ROLE_KEY: context.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET',
    allEnvKeys: Object.keys(context.env)
  };

  return new Response(JSON.stringify(envVars, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
