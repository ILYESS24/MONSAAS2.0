export async function onRequest(context) {
  // Return environment configuration for the frontend
  const config = {
    VITE_SUPABASE_URL: "https://otxxjczxwhtngcferckz.supabase.co",
    VITE_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90eHhqY3p4d2h0bmdjZmVyY2t6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NDcxOTEsImV4cCI6MjA4MTIyMzE5MX0.B4A300qQZCwP-aG4J29KfeazJM_Pp1eHKXQ98_bLMw8",
    VITE_STRIPE_PUBLISHABLE_KEY: "pk_live_51PrM0F018rEaMULFvPnbftQHXqZtMtvJUJQ6qMZ2tA3WfYfP8Z2iN98vrDhxwTIuhp5mGlvNLcryQ8ejt9btwRQW00aUZCV0e5",
    VITE_CLERK_PUBLISHABLE_KEY: "pk_test_YXNzdXJlZC1zYWxtb24tMzkuY2xlcmsuYWNjb3VudHMuZGV2JA"
  };

  return new Response(JSON.stringify(config), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
}
