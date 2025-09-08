import { createClient } from '@supabase/supabase-js';


// Initialize Supabase client
// Using direct values from project configuration
const supabaseUrl = 'https://qzrcbuzvgcyahevtsfms.supabase.co';
const supabaseKey = 'sb_publishable_dp3xfRvvPqJasnYWfDpQqw_rs6LiYVA';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };