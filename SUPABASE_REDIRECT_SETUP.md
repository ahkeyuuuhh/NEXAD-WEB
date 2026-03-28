# Supabase Redirect URL Configuration

## Important: Configure OAuth Redirect URLs in Supabase

To ensure the login system works properly on your deployed website, you need to add the following redirect URLs to your Supabase project:

### Steps to Configure:

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project (klrfkhyvgtffsjpdioax)
3. Navigate to: **Authentication** → **URL Configuration**
4. Add the following URLs to the **Redirect URLs** section:

### Production URLs (Add these):
```
https://nexad-web.vercel.app/login.html
https://nexad-web.vercel.app/contact.html
```

### Local Development URLs (Optional, for testing):
```
http://localhost:8080/login.html
http://localhost:8080/contact.html
http://127.0.0.1:8080/login.html
http://127.0.0.1:8080/contact.html
```

### Site URL Configuration:
Set the **Site URL** to:
```
https://nexad-web.vercel.app
```

## What Changed:

### 1. Dedicated Login Screen
- The "Login" button in the navigation now directs to `/login.html` instead of `/contact.html`
- Users must authenticate on the login page before accessing the contact form
- After successful login, users are redirected to the contact page

### 2. Session Persistence
- Users stay logged in across page refreshes
- Sessions are stored in localStorage
- Users can send multiple contact messages without re-logging in
- Sessions automatically refresh when needed

### 3. Favicon Updated
- All pages now use `Light-logo-NoText-noBg.png` as the favicon
- This provides consistent branding across all browser tabs

## User Flow:

1. User clicks "Login" in navigation → Redirected to `/login.html`
2. User clicks "Continue with Google" → Google OAuth flow
3. After authentication → Redirected back to `/login.html` with tokens
4. Session is established → Automatically redirected to `/contact.html`
5. User can now send messages
6. After sending a message → Form resets but user stays logged in
7. User can send another message without re-authenticating

## Testing:

1. Deploy the changes to Vercel
2. Configure the redirect URLs in Supabase (as shown above)
3. Visit https://nexad-web.vercel.app
4. Click "Login" in the navigation
5. Sign in with Google
6. Verify you're redirected to the contact page
7. Send a test message
8. Verify the form resets and you can send another message without logging in again

## Important Notes:

- Make sure to add BOTH the login.html and contact.html URLs to Supabase
- The redirect URLs must match exactly (including https://)
- After adding the URLs, wait a few minutes for the changes to propagate
- If login fails, check the browser console for error messages
