import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = 'https://dsuasvsscejcskjnvirp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzdWFzdnNzY2VqY3Nram52aXJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MTI0NTcsImV4cCI6MjA1Nzk4ODQ1N30.ZzgiaXItvAYV5q5s2Ad6u12arFA4vC9ggbHaJkhxHmc';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);