Parse the following input and add the relevant event(s) to Google Calendar using the Google Calendar MCP tool (`mcp__claude_ai_Google_Calendar__create_event`). The input may be raw email text, a forwarded thread, or a mix of languages — extract only what's relevant to scheduling.

Input: $ARGUMENTS

Steps:

1. Identify and extract all calendar-relevant fields from the input, ignoring unrelated content (greetings, signatures, marketing copy, etc.):
   - Title: infer a short descriptive title if not explicitly stated (e.g. "Lunch with Alex", "Project Kickoff")
   - Date: normalize to ISO 8601 format (YYYY-MM-DDTHH:MM:SS); if relative (e.g. "this Friday", "下周二"), resolve against today's date
   - Start time and end time: if end time or duration is missing, default to 1 hour
   - Time zone: default to Europe/Stockholm unless otherwise specified
   - Location: physical address or video link if present
   - Description: any useful context (agenda, organizer, meeting link, etc.)
2. If the input contains multiple languages, translate relevant fields to English for the title and description.
3. If multiple events are found, add each one separately.
4. If a required field (date or time) is genuinely ambiguous, ask the user to clarify before proceeding.
5. Use the `mcp__claude_ai_Google_Calendar__create_event` tool for each event with the extracted fields.
6. Confirm each event added with a concise summary: title, date/time, location (if any).
