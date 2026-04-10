import { createClient } from '@supabase/supabase-js';

// Используем переменные среды (Vite использует префикс VITE_ и объект import.meta.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL; 
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);