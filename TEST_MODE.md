# Testing Wichtel Wizard with Multiple Users

Since you only have one phone number for SMS authentication, here's how to test the full flow with multiple users:

## Method 1: Use Test Participant Button (Easiest - Recommended)

In development mode, a special "Dev Mode: Add Test Participants" panel appears on the group page.

### Steps:

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Create a group:**
   - Log in with your phone number
   - Create a new group
   - Note the group code

3. **Add test participants:**
   - On the group page, you'll see a yellow dev mode panel
   - Enter the number of test users you want to add (1-10)
   - Click "Add X Test Users"
   - Test participants will be created instantly with unique anonymous names

4. **Test the flow:**
   - Add wishes for your real account
   - Perform the "Auslosung" (drawing)
   - Check your terminal for SMS logs sent to all participants
   - View your assignment

### What happens behind the scenes:
- Test users are created with fake phone numbers (`+49test...`)
- Each gets a unique anonymous name from the pool
- They're added as real participants in the database
- No SMS authentication required

## Method 2: Use Multiple Browser Profiles

This method simulates multiple real users logging in with the same phone number.

### Steps:

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Create Browser Profiles:**
   - **Chrome**: Click your profile icon → "Add" → Create new profile
   - **Firefox**: Go to `about:profiles` → Create new profile
   - **Safari**: Use regular window + private window

3. **Use Your Real Phone Number in Each Profile:**
   - Each browser profile has separate cookies/sessions
   - You can log in with the same phone number in each profile
   - Each will be treated as a different user session

4. **Test the Flow:**

   **Profile 1 (Creator):**
   - Log in with your phone number
   - Create a group
   - Note the group code

   **Profile 2 (User 2):**
   - Log in with your phone number (gets new verification code)
   - Join the group using the code
   - Watch your terminal for SMS test log: "User 2 joined!"

   **Profile 3 (User 3):**
   - Log in with your phone number
   - Join the group
   - Watch your terminal for SMS test log: "User 3 joined!"

   **Back to Profile 1:**
   - Perform the "Auslosung" (drawing)
   - Check terminal for SMS logs to all participants

   **Check All Profiles:**
   - Each profile can see their assignment
   - Different anonymous names in each profile

## Method 2: Use Incognito/Private Windows

Faster but more limited (can only have ~3-4 users):

1. Regular window = User 1
2. Incognito window = User 2
3. Different browser incognito = User 3

## What You'll See in the Terminal

When in development mode (`npm run dev`), all SMS messages are logged instead of being sent:

```
📱 SMS (TEST MODE - not sent): {
  to: '+49123456789',
  message: 'Wichtel Wizard: Festive Snowman ist deiner Gruppe "Test Group" beigetreten! 🎁',
  timestamp: '2025-11-05T15:53:37.000Z'
}
```

## Testing Checklist

- [ ] Create a group (as User 1)
- [ ] Join with 3+ different profiles
- [ ] Verify "user joined" SMS logged to console (sent to creator)
- [ ] Add wishes in each profile
- [ ] Perform drawing (only visible to creator)
- [ ] Verify "drawing complete" SMS logged for all users
- [ ] Check each profile sees their assigned person
- [ ] Verify no one got themselves

## Production Testing

On Vercel (production), the real SMS will be sent to your phone number. If multiple people try to join with the same phone number, they'll get new verification codes each time, but they'll be treated as the same user (same user ID).

For real production testing, you'll need friends/family with different phone numbers to test the full multi-user flow.

## Notes

- Test mode automatically activates when `NODE_ENV=development`
- The test login API endpoint is **completely disabled** in production
- SMS messages are only logged in development, real SMS sent in production
- Each browser profile maintains its own NextAuth session cookie
