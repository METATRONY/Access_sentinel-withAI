import { createClient } from '@supabase/supabase-js';

// Get Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qzrcbuzvgcyahevtsfms.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6cmNidXp2Z2N5YWhldnRzZm1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI3NzIsImV4cCI6MjA1MDU0ODc3Mn0.dp3xfRvvPqJasnYWfDpQqw_rs6LiYVAhKLPBHlI-Yxo';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };