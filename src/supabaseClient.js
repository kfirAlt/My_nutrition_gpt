import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://srycjgtzexmzxnmwmzxx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyeWNqZ3R6ZXhtenhubXdtenh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2OTcxMzksImV4cCI6MjA2OTI3MzEzOX0.CtR_L9uNr6IB7r0OgKUrBHimUQ_jhy9SQ4xBR6M0NXU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 