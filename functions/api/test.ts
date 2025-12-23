// Test function to diagnose Cloudflare Functions deployment
export const onRequestGet: PagesFunction = async (context) => {
  return new Response(JSON.stringify({
    message: 'Cloudflare Functions are working!',
    timestamp: new Date().toISOString(),
    url: context.request.url,
    method: context.request.method
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
};
