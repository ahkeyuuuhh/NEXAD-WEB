# Google OAuth Flow Diagram

## Visual Flow Chart

```
┌─────────────────────────────────────────────────────────────────────┐
│                         WEBSITE OAUTH FLOW                          │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   User       │
│   Visits     │
│ contact.html │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│  checkExistingSession()                                      │
│  • Check URL for OAuth tokens (hash/query params)           │
│  • Check for existing Supabase session                      │
└──────┬───────────────────────────────────────────────────────┘
       │
       ├─── No Session ───┐
       │                  │
       │                  ▼
       │         ┌────────────────────┐
       │         │  Show Google       │
       │         │  Sign-In Button    │
       │         └────────┬───────────┘
       │                  │
       │                  │ User Clicks
       │                  ▼
       │         ┌────────────────────────────────────────┐
       │         │  handleGoogleSignIn()                  │
       │         │  • Show "Signing in..." loading state  │
       │         │  • Call supabase.auth.signInWithOAuth()│
       │         └────────┬───────────────────────────────┘
       │                  │
       │                  ▼
       │         ┌────────────────────────────────────────┐
       │         │  Supabase OAuth                        │
       │         │  • Generate OAuth URL                  │
       │         │  • Redirect to Google                  │
       │         └────────┬───────────────────────────────┘
       │                  │
       │                  ▼
       │         ┌────────────────────────────────────────┐
       │         │  Google OAuth Consent Screen           │
       │         │  • User sees app permissions           │
       │         │  • User authorizes app                 │
       │         └────────┬───────────────────────────────┘
       │                  │
       │                  ▼
       │         ┌────────────────────────────────────────┐
       │         │  Google Redirects to Supabase          │
       │         │  • Supabase validates authorization    │
       │         │  • Generates access & refresh tokens   │
       │         └────────┬───────────────────────────────┘
       │                  │
       │                  ▼
       │         ┌────────────────────────────────────────┐
       │         │  Supabase Redirects to Website         │
       │         │  URL: contact.html#access_token=...    │
       │         └────────┬───────────────────────────────┘
       │                  │
       │                  ▼
       │         ┌────────────────────────────────────────┐
       │         │  checkExistingSession() (on page load) │
       │         │  • Extract tokens from URL             │
       │         │  • Call supabase.auth.setSession()     │
       │         └────────┬───────────────────────────────┘
       │                  │
       │                  ▼
       │         ┌────────────────────────────────────────┐
       │         │  Session Created                       │
       │         │  • Store user info in currentUser      │
       │         │  • Clean URL (remove tokens)           │
       │         └────────┬───────────────────────────────┘
       │                  │
       └──────────────────┘
                          │
                          ▼
                 ┌────────────────────────────────────────┐
                 │  showContactForm()                     │
                 │  • Hide auth section                   │
                 │  • Show contact form                   │
                 │  • Pre-fill name and email             │
                 └────────┬───────────────────────────────┘
                          │
                          ▼
                 ┌────────────────────────────────────────┐
                 │  User Fills Message                    │
                 │  • Name (pre-filled, readonly)         │
                 │  • Email (pre-filled, readonly)        │
                 │  • Message (user types)                │
                 └────────┬───────────────────────────────┘
                          │
                          ▼
                 ┌────────────────────────────────────────┐
                 │  handleFormSubmit()                    │
                 │  • Store contact data                  │
                 │  • Show success message                │
                 │  • Sign out user after 3 seconds       │
                 └────────────────────────────────────────┘
```

## Detailed Step Breakdown

### Step 1: Initial Page Load
```javascript
// contact.html loads
document.addEventListener('DOMContentLoaded', function() {
    initializeContactPage();
    setupEventListeners();
    checkExistingSession(); // ← Checks for tokens or existing session
});
```

### Step 2: Check for Session
```javascript
async function checkExistingSession() {
    // Check URL for OAuth tokens
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    
    if (accessToken) {
        // Coming back from OAuth redirect
        await supabase.auth.setSession({ access_token, refresh_token });
        showContactForm();
    } else {
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            showContactForm();
        }
    }
}
```

### Step 3: User Clicks Google Sign-In
```javascript
async function handleGoogleSignIn() {
    // Show loading state
    googleSignInBtn.innerHTML = '<span>Signing in...</span>';
    
    // Start OAuth flow
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin + window.location.pathname
        }
    });
    
    // Browser redirects to Google...
}
```

### Step 4: Google OAuth Flow
```
User Browser → Google OAuth Server
              ↓
         [User Authorizes]
              ↓
Google → Supabase Callback URL
              ↓
         [Supabase validates]
              ↓
Supabase → Website with tokens in URL
```

### Step 5: Token Extraction & Session Creation
```javascript
// Page reloads with tokens in URL
// Example: contact.html#access_token=xxx&refresh_token=yyy

// checkExistingSession() runs again
const accessToken = hashParams.get('access_token');
if (accessToken) {
    // Create session
    await supabase.auth.setSession({ access_token, refresh_token });
    
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
    // URL is now clean: contact.html (no tokens)
}
```

### Step 6: Show Contact Form
```javascript
function showContactForm() {
    // Hide Google button
    authSection.style.display = 'none';
    
    // Show form
    contactForm.style.display = 'flex';
    
    // Pre-fill user data
    nameInput.value = currentUser.name;
    emailInput.value = currentUser.email;
}
```

## URL States During Flow

### State 1: Initial Visit
```
http://localhost:8080/contact.html
```

### State 2: After Google Redirect (with tokens)
```
http://localhost:8080/contact.html#access_token=eyJhbGc...&refresh_token=v1.MXx...&expires_in=3600&token_type=bearer
```

### State 3: After Token Extraction (cleaned)
```
http://localhost:8080/contact.html
```

## Console Log Timeline

```
[Page Load]
🔵 [Session] Checking for existing session...
🟡 [Session] No existing session found

[User Clicks Button]
🔵 [OAuth] Starting Google OAuth...
🔵 [OAuth] Redirect URL: http://localhost:8080/contact.html
🔵 [OAuth] Redirecting to Google...

[Browser Redirects to Google]
[User Authorizes]
[Browser Redirects Back]

[Page Reloads]
🔵 [Session] Checking for existing session...
🟢 [Session] Found OAuth tokens in URL, setting session...
🟢 [Session] Session set successfully: user@gmail.com

[Form Appears]
```

## Error Scenarios

### Scenario 1: Redirect URI Mismatch
```
🔵 [OAuth] Starting Google OAuth...
🔴 [OAuth] Error: redirect_uri_mismatch

Fix: Add URL to Google Cloud Console
```

### Scenario 2: Missing Supabase Configuration
```
🔵 [OAuth] Redirecting to Google...
[Redirect back]
🔴 [Session] Error setting session: Invalid redirect URL

Fix: Add URL to Supabase Dashboard
```

### Scenario 3: User Cancels
```
🔵 [OAuth] Starting Google OAuth...
[User closes Google consent screen]
[Page stays on contact.html]
🟡 [Session] No existing session found
```

## Security Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY MEASURES                        │
└─────────────────────────────────────────────────────────────┘

1. OAuth Tokens in URL
   ├─ Extracted immediately on page load
   ├─ Used to create session
   └─ Removed from URL via history.replaceState()

2. Session Storage
   ├─ Stored securely by Supabase client
   ├─ Uses httpOnly cookies (if available)
   └─ Auto-refreshes with refresh token

3. User Data
   ├─ Only name and email extracted
   ├─ Stored in memory (currentUser variable)
   └─ Cleared on sign out

4. Form Submission
   ├─ Validates user is authenticated
   ├─ Stores data locally (for demo)
   └─ Signs out user after submission
```

## Mobile vs Website Flow Comparison

### Mobile App Flow:
```
User → expo-web-browser → Google → Deep Link (nexad://) → Token Extraction → Session
```

### Website Flow:
```
User → Browser Redirect → Google → HTTP Redirect → Token Extraction → Session
```

### Key Difference:
- **Mobile**: Uses in-app browser + deep linking
- **Website**: Uses native browser redirect

### Same Result:
- Both create Supabase session
- Both extract user info from Google
- Both use same Supabase project
- Both provide same user experience

## Configuration Requirements

### Supabase Dashboard:
```
Authentication → URL Configuration → Redirect URLs
├─ http://localhost:8080/contact.html (local)
└─ https://yourdomain.com/contact.html (production)
```

### Google Cloud Console:
```
APIs & Services → Credentials → OAuth 2.0 Client
├─ Authorized JavaScript origins:
│  ├─ http://localhost:8080 (local)
│  └─ https://yourdomain.com (production)
└─ Authorized redirect URIs:
   └─ https://klrfkhyvgtffsjpdioax.supabase.co/auth/v1/callback
```

## Testing Checklist

- [ ] Local server running
- [ ] Supabase redirect URL configured
- [ ] Google Cloud origins configured
- [ ] Browser console open
- [ ] Click "Continue with Google"
- [ ] Redirected to Google
- [ ] Authorize app
- [ ] Redirected back to website
- [ ] Console shows "Session set successfully"
- [ ] Form appears with pre-filled data
- [ ] URL is clean (no tokens)
- [ ] Can submit form successfully

## Success Indicators

✅ No errors in console
✅ Smooth redirect to Google
✅ Smooth redirect back to website
✅ Session created successfully
✅ Form appears automatically
✅ Name and email pre-filled
✅ URL cleaned of tokens
✅ Can submit form
