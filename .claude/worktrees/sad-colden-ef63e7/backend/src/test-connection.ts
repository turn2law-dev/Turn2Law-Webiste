import { testSupabaseConnection } from './config/supabase';

async function runTest() {
  console.log('🔍 Testing Supabase connection...');
  
  const isConnected = await testSupabaseConnection();
  
  if (isConnected) {
    console.log('✅ Backend setup successful!');
    console.log('📝 Next steps:');
    console.log('1. Run the database_schema.sql in your Supabase dashboard');
    console.log('2. Start the backend server with: npm run dev');
  } else {
    console.log('❌ Connection failed. Please check your credentials.');
  }
}

runTest().catch(console.error);
