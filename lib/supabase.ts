import { createClient } from '@supabase/supabase-js'

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined'
  )
}

// Create Supabase client with additional options for better security and performance
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-application-name': 'zilk-app'
    }
  }
})

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return !!user
  } catch (error) {
    console.error('Auth check failed:', error)
    return false
  }
}

// Helper function to check if user is business owner
export const isBusinessOwner = async () => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) throw authError
    if (!user) return false

    const { data, error } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', user.id)
      .single()

    if (error) throw error
    return !!data
  } catch (error) {
    console.error('Business owner check failed:', error)
    return false
  }
}