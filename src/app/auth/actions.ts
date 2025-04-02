'use server'

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server'; // For user session handling
import { createClient as createSupabaseClient } from '@supabase/supabase-js'; // For admin client

// Magic link authentication
export async function sendMagicLink(formData: FormData) {
  const email = formData.get('email') as string
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })
  
  if (error) {
    return { error: error.message }
  }
  
  return { success: true }
}

// Google OAuth
export async function signInWithGoogle() {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })
  
  if (error) {
    return { error: error.message }
  }
  
  return redirect(data.url)
}

// Delete User Account (Requires Service Role Key)
export async function deleteUserAccount() {
  'use server'; // Ensure this runs on the server

  const cookieStore = cookies();
  const supabase = await createClient(); // Use the standard server client first to get the user

  const {
    data: { user },
    error: getUserError,
  } = await supabase.auth.getUser();

  if (getUserError || !user) {
    console.error('Error getting user for deletion:', getUserError);
    return { error: 'Could not authenticate user for deletion.' };
  }

  const userId = user.id;

  // Now create an admin client using the service role key
  // IMPORTANT: Ensure SUPABASE_SERVICE_ROLE_KEY is set in your environment variables
  const supabaseAdmin = createSupabaseClient( // Use the core client creator
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use the service role key
    {
      auth: {
        // These options prevent the admin client from interfering with user sessions
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  // Delete the user
  const { error: deleteError } =
    await supabaseAdmin.auth.admin.deleteUser(userId);

  if (deleteError) {
    console.error('Error deleting user:', deleteError);
    return { error: `Failed to delete account: ${deleteError.message}` };
  }

  // Sign the user out locally after successful deletion
  await supabase.auth.signOut();

  // Redirect to homepage after deletion
  return redirect('/');
}

// Discord OAuth
export async function signInWithDiscord() {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })
  
  if (error) {
    return { error: error.message }
  }
  
  return redirect(data.url)
}
