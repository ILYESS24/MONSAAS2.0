export async function onRequest({ request, next }) {
  const response = await next();

  // Fix MIME types for JavaScript files
  const url = new URL(request.url);

  if (url.pathname === '/script.js' || url.pathname.endsWith('.js')) {
    console.log('🔧 Fixing MIME type for JS file:', url.pathname);
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Content-Type', 'application/javascript');
    newResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    return newResponse;
  }

  return response;
}