// Simplified Stripe webhook handler for testing
export const onRequestPost: PagesFunction = async (context) => {
  try {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    };

    // Check if we have the required environment variables
    const webhookSecret = context.env?.STRIPE_WEBHOOK_SECRET;
    const stripeSecret = context.env?.STRIPE_SECRET_KEY;
    const supabaseUrl = context.env?.SUPABASE_URL;
    const supabaseKey = context.env?.SUPABASE_SERVICE_ROLE_KEY;

    if (!webhookSecret || !stripeSecret || !supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({
        error: 'Missing environment variables',
        hasWebhookSecret: !!webhookSecret,
        hasStripeSecret: !!stripeSecret,
        hasSupabaseUrl: !!supabaseUrl,
        hasSupabaseKey: !!supabaseKey
      }), {
        status: 500,
        headers: corsHeaders
      });
    }

    const body = await context.request.text();
    const signature = context.request.headers.get('stripe-signature');

    if (!signature) {
      return new Response(JSON.stringify({
        error: 'No stripe-signature header',
        receivedHeaders: Array.from(context.request.headers.keys())
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // For testing, just return success without processing
    return new Response(JSON.stringify({
      success: true,
      message: 'Webhook received successfully',
      bodyLength: body.length,
      hasSignature: !!signature,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error: any) {
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};
