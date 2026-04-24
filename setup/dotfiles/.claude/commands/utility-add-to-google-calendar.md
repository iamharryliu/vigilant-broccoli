Parse the following input and add the relevant event(s) to Google Calendar using the `gcalcli` CLI tool. The input may be raw email text, a forwarded thread, or a mix of languages — extract only what's relevant to scheduling.

Input: $ARGUMENTS

Steps:

1. Identify and extract all calendar-relevant fields from the input, ignoring unrelated content (greetings, signatures, marketing copy, etc.):
   - Title: infer a short descriptive title if not explicitly stated (e.g. "Lunch with Alex", "Project Kickoff")
   - Date: normalize to YYYY-MM-DD; if relative (e.g. "this Friday", "下周二"), resolve against today's date
   - Start time: normalize to HH:MM (24h)
   - End time or duration: if missing, default to 1 hour
   - Location: physical address or video link if present
   - Description: any useful context (agenda, organizer, meeting link, etc.)
2. If the input contains multiple languages, translate relevant fields to English for the title and description.
3. If multiple events are found, add each one separately.
4. If a required field (date or time) is genuinely ambiguous, ask the user to clarify before proceeding.
5. Run gcalcli for each event:
   `gcalcli add --title "..." --when "YYYY-MM-DD HH:MM" --duration MM --where "..." --description "..." --allday false --noprompt`
6. Confirm each event added with a concise summary: title, date/time, location (if any).
