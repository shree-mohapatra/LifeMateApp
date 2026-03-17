import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = 'https://xppvhneypazwzlyetolx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwcHZobmV5cGF6d3pseWV0b2x4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NDQ5MTIsImV4cCI6MjA4MzQyMDkxMn0.XYIJR_w41htQ7E8oheisHQlDm5blgyk_21fYlnnhGAk';



const storage =
  Platform.OS === 'web'
    ? undefined     // browser uses localStorage automatically
    : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});