/**
 * Clean Database Script
 * Removes all sample/mock data from Supabase
 *
 * Usage: node clean-db.js
 * Make sure to set SUPABASE_URL and SUPABASE_ANON_KEY environment variables
 */

import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables');
  console.error('');
  console.error('Alternative: Execute clean-database.sql directly in Supabase SQL Editor');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanDatabase() {
  console.log('🧹 Cleaning database...');

  try {
    // Delete sample projects
    console.log('📁 Deleting sample projects...');
    const { error: projectsError } = await supabase
      .from('projects')
      .delete()
      .in('name', ['Aurion IDE', 'AI Assistant', 'Intelligent Canvas', 'Chat System', 'Text Editor']);

    if (projectsError) throw projectsError;
    console.log('✅ Projects deleted');

    // Delete sample activities
    console.log('📋 Deleting sample activities...');
    const { error: activitiesError } = await supabase
      .from('activities')
      .delete()
      .in('user_name', ['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Eva Brown']);

    if (activitiesError) throw activitiesError;
    console.log('✅ Activities deleted');

    // Delete sample users
    console.log('👥 Deleting sample users...');
    const { error: usersError } = await supabase
      .from('users')
      .delete()
      .like('email', '%@example.com');

    if (usersError) throw usersError;
    console.log('✅ Users deleted');

    // Verify cleanup
    console.log('🔍 Verifying cleanup...');
    const { data: counts, error: countError } = await supabase
      .rpc('get_table_counts');

    if (countError) {
      // Fallback: manual count queries
      const [{ count: projects }, { count: activities }, { count: users }] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('activities').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true })
      ]);

      console.log('📊 Database status:');
      console.log(`   Projects: ${projects}`);
      console.log(`   Activities: ${activities}`);
      console.log(`   Users: ${users}`);
    }

    console.log('🎉 Database cleaned successfully! All sample data removed.');

  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    process.exit(1);
  }
}

cleanDatabase();