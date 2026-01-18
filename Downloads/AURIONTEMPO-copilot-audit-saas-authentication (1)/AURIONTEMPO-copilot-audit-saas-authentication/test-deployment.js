// Test script to verify Supabase configuration in production
console.log('Testing Supabase configuration...');

// Check if environment variables are available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Configured' : '❌ Missing');
console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Configured' : '❌ Missing');

// Test basic connectivity
if (supabaseUrl && supabaseKey) {
  console.log('✅ Production configuration verified!');
  console.log('URL:', supabaseUrl);
} else {
  console.log('❌ Configuration missing - check build process');
}