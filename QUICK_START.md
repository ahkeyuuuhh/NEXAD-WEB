# Quick Start Guide - Google OAuth

## 🚀 Get Started in 3 Steps

### Step 1: Configure Supabase (2 minutes)

1. Go to: https://supabase.com/dashboard/project/klrfkhyvgtffsjpdioax/auth/url-configuration
2. Scroll to **Redirect URLs**
3. Add this URL:
   ```
   http://localhost:8080/contact.html
   ```
4. Click **Save**

### Step 2: Configure Google Cloud (2 minutes)

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click your OAuth 2.0 Client ID
3. Under **Authorized JavaScript origins**, add:
   ```
   http://localhost:8080
   ```
4. Under **Authorized redirect URIs**, ensure this exists:
   ```
   https://klrfkhyvgtffsjpdioax.supabase.co/auth/v1/callback
   ```
5. Click **Save**

### Step 3: Test Locally (1 minute)

1. Open terminal in project root:
   ```bash
   cd nexad-website
   python -m http.server 8080
   ```

2. Open browser:
   ```
   http://localhost:8080/contact.html
   ```

3. Open Developer Tools (F12) → Console

4. Click **"Continue with Google"**

5. Watch for success message:
   ```
   🟢 [Session] Session set successfully: your-email@gmail.com
   ```

## ✅ Success Checklist

- [ ] Supabase redirect URL added
- [ ] Google Cloud origins configured
- [ ] Local server running on port 8080
- [ ] Browser console open
- [ ] Clicked "Continue with Google"
- [ ] Saw Google consent screen
- [ ] Redirected back to website
- [ ] Form appeared with pre-filled data
- [ ] No errors in console

## 🎯 Expected Result

After clicking "Continue with Google":

1. ✅ Redirect to Google consent screen
2. ✅ Authorize app
3. ✅ Redirect back to contact page
4. ✅ Contact form appears
5. ✅ Name and email pre-filled
6. ✅ URL is clean (no tokens visible)

## 🐛 Common Issues

### Issue: "redirect_uri_mismatch"
**Fix:** Add `http://localhost:8080` to Google Cloud Console → Authorized JavaScript origins

### Issue: No form after redirect
**Fix:** Add `http://localhost:8080/contact.html` to Supabase → Redirect URLs

### Issue: CORS error
**Fix:** Use `python -m http.server 8080` (don't open file:// directly)

## 📱 For Production

When deploying to production:

1. Update Supabase redirect URLs:
   ```
   https://yourdomain.com/contact.html
   ```

2. Update Google Cloud origins:
   ```
   https://yourdomain.com
   ```

3. Ensure HTTPS is enabled

4. Test OAuth flow on production domain

## 📚 Full Documentation

- **Complete Setup**: `WEBSITE_GOOGLE_AUTH_SETUP.md`
- **Testing Guide**: `TEST_OAUTH.md`
- **Flow Diagram**: `OAUTH_FLOW_DIAGRAM.md`
- **Implementation Summary**: `GOOGLE_AUTH_IMPLEMENTATION_SUMMARY.md`

## 🆘 Need Help?

Check browser console for error messages:
- `🔴` = Error (something went wrong)
- `🟢` = Success (working correctly)
- `🟡` = Warning (informational)
- `🔵` = Info (normal operation)

## 🎉 That's It!

Your Google OAuth is now configured and ready to use. The website will authenticate users the same way as the mobile app.
