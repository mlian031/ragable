import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  console.log('Callback route hit. Code:', code); // <-- Added logging

  if (code) {
    const supabase = await createClient(
      
    )
    console.log('Attempting code exchange...'); // <-- Added logging
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    // Log the error object itself for more details if it exists
    console.log('Code exchange result - Error object:', error); // <-- Added logging

    if (!error) {
      console.log('Code exchange successful. Redirecting to /chat'); // <-- Added logging
      // Construct the URL using the reliable public site URL
      const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/chat`;
      console.log('Redirecting to:', redirectUrl); // Log the correct URL
      return NextResponse.redirect(redirectUrl);
    } else {
      // Log the specific error message from Supabase
      console.error('Supabase code exchange error message:', error.message); // <-- Added logging
    }
  } else {
    console.log('No code found in URL.'); // <-- Added logging
  }

  // Return the user to an error page with instructions
  console.log('Redirecting to error page /auth/error'); // <-- Added logging
   // Construct the URL using the reliable public site URL
  const errorUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/error`;
  console.log('Redirecting to:', errorUrl); // Log the correct URL
  return NextResponse.redirect(errorUrl);
}
