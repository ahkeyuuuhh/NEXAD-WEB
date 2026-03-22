# Quick OAuth Testing Guide

## Test Locally (Recommended First Step)

### 1. Start Local Server

Open terminal in the project root and run:

```bash
# Option 1: Python (if installed)
cd nexad-website
python -m http.server 8080

# Option 2: Node.js (if installed)
cd nexad-website
npx http-server -p 8080

# Option 3: PHP (if installed)
cd nexad-website
php -S localhost:8080
```

### 2. Configure Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/klrfkhyvgtffsjpdioax/auth/url-configuration
2. Add this URL to **Redirect URLs**:
   ```
   http://localhost:8080/contact.html
   ```
3. Click **Save**

### 3. Configure Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Select your OAuth 2.0 Client ID
3. Add to **Authorized JavaScript origins**:
   ```
   http://localhost:8080
   ```
4. Ensure this is in **Authorized redirect URIs**:
   ```
   https://klrfkhyvgtffsjpdioax.supabase.co/auth/v1/callback
   ```
5. Click **Save**

### 4. Test the Flow

1. Open browser: `http://localhost:8080/contact.html`
2. Open Developer Tools (F12) → Console tab
3. Click "Continue with Google" button
4. Watch console logs for OAuth flow:
   ```
   🔵 [OAuth] Starting Google OAuth...
   🔵 [OAuth] Redirect URL: http://localhost:8080/contact.html
   🔵 [OAuth] Redirecting to Google...
   ```
5. After Google authorization, you should see:
   ```
   🟢 [Session] Found OAuth tokens in URL, setting session...
   🟢 [Session] Session set successfully: your-email@gmail.com
   ```
6. Contact form should appear with your name and email

## Expected Console Output

### Successful Flow:
```
🔵 [Session] Checking for existing session...
🟡 [Session] No existing session found
🔵 [OAuth] Starting Google OAuth...
🔵 [OAuth] Redirect URL: http://localhost:8080/contact.html
🔵 [OAuth] Redirecting to Google...
[Page redirects to Google]
[User authorizes]
[Page redirects back]
🔵 [Session] Checking for existing session...
🟢 [Session] Found OAuth tokens in URL, setting session...
🟢 [Session] Session set successfully: user@gmail.com
```

### Failed Flow (Missing Configuration):
```
🔵 [OAuth] Starting Google OAuth...
🔴 [OAuth] Error: redirect_uri_mismatch
```
**Fix:** Add the redirect URL to Google Cloud Console

## Common Issues & Fixes

### Issue 1: "redirect_uri_mismatch"
- **Cause:** URL not in Google Cloud Console
- **Fix:** Add `http://localhost:8080` to Authorized JavaScript origins
- **Fix:** Add Supabase callback URL to Authorized redirect URIs

### Issue 2: No session after redirect
- **Cause:** URL not in Supabase Dashboard
- **Fix:** Add `http://localhost:8080/contact.html` to Supabase Redirect URLs

### Issue 3: CORS error
- **Cause:** Not using proper local server
- **Fix:** Use one of the server commands above (don't open file:// directly)

### Issue 4: Tokens still in URL
- **Cause:** JavaScript error preventing cleanup
- **Fix:** Check console for errors, ensure Supabase client loaded

## Testing Checklist

- [ ] Local server running on port 8080
- [ ] Supabase redirect URL configured
- [ ] Google Cloud Console origins configured
- [ ] Google Cloud Console redirect URI configured
- [ ] Browser console open to see logs
- [ ] Clicked "Continue with Google" button
- [ ] Successfully redirected to Google
- [ ] Successfully redirected back to website
- [ ] Session created (check console logs)
- [ ] Contact form appeared
- [ ] Name and email pre-filled
- [ ] URL cleaned (no tokens visible)

## Production Deployment

Once local testing works:

1. Deploy website to production domain
2. Update Supabase redirect URLs with production URL
3. Update Google Cloud Console with production domain
4. Test OAuth flow on production
5. Monitor for any errors

## Quick Debug Commands

Open browser console and run:

```javascript
// Check if Supabase is loaded
console.log('Supabase:', window.supabase);

// Check current session
supabase.auth.getSession().then(({data}) => console.log('Session:', data));

// Check current user
supabase.auth.getUser().then(({data}) => console.log('User:', data));

// Sign out (for testing)
supabase.auth.signOut().then(() => console.log('Signed out'));
```

## Success Criteria

✅ OAuth flow completes without errors
✅ Console shows "Session set successfully"
✅ Contact form appears after authentication
✅ Name and email are pre-filled
✅ URL is clean (no tokens visible)
✅ Form can be submitted successfully

## Need Help?

1. Check browser console for error messages
2. Verify all URLs match exactly (including http/https)
3. Ensure Google OAuth client is enabled
4. Check Supabase project is active
5. Try signing out and signing in again
