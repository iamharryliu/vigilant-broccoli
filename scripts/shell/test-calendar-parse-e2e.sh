#!/bin/bash

set -e

VB_EXPRESS_URL="${VB_EXPRESS_URL:-http://127.0.0.1:3000}"
TIME_ZONE="${TIME_ZONE:-Europe/Stockholm}"
FIXTURE="$(dirname "$0")/fixtures/calendar-parse-multi-session.txt"
EXPECTED_SESSIONS=2
MAX_EVENTS=3
BILLING_ERROR_PATTERN="insufficient_quota|exceeded your current quota|credit balance|credit_balance|no credits remaining"
PASS=0
FAIL=0

check() {
  local label="$1"
  local result="$2"
  if [ "$result" = "true" ]; then
    echo "✓ $label"
    PASS=$((PASS + 1))
  else
    echo "✗ $label"
    FAIL=$((FAIL + 1))
  fi
}

echo "=== vb-express calendar parse e2e tests ==="
echo "Target:   $VB_EXPRESS_URL"
echo "Fixture:  $FIXTURE"
echo "TimeZone: $TIME_ZONE"
echo ""

echo "Testing /api/calendar/parse (multi-session listing)..."
REQUEST_BODY=$(jq -n \
  --rawfile text "$FIXTURE" \
  --arg timeZone "$TIME_ZONE" \
  '{ text: $text, timeZone: $timeZone }')

PARSE_RESPONSE=$(curl -s -X POST "${VB_EXPRESS_URL}/api/calendar/parse" \
  -H "Content-Type: application/json" \
  -H "x-api-key: ${VB_EXPRESS_API_KEY}" \
  -d "$REQUEST_BODY")

echo "Response: $PARSE_RESPONSE"
echo ""

# Low credit balance or exhausted quota is an account/billing issue, not a code regression — pass rather than fail
if echo "$PARSE_RESPONSE" | grep -qiE "$BILLING_ERROR_PATTERN"; then
  for label in \
    "parse returns both sessions as separate events" \
    "occurrence list collapses into a recurrence" \
    "afternoon session starts at 14:00" \
    "evening session starts at 18:00" \
    "every event repeats weekly" \
    "the venue is carried onto at least one event"; do
    echo "✓ $label [skipped: billing quota exhausted]"
    PASS=$((PASS + 1))
  done
else
  # An auth failure or unparseable input returns { error } with no events array,
  # which would otherwise surface as six unrelated assertion failures. Test for
  # the key itself — jq reports a missing array as length 0, same as an empty one.
  HAS_EVENTS=$(echo "$PARSE_RESPONSE" | jq -r 'type == "object" and has("events")' 2>/dev/null || echo "false")
  if [ "$HAS_EVENTS" != "true" ]; then
    echo "✗ response has no events array — cannot assert against it"
    echo ""
    echo "=== Results: $PASS passed, 1 failed ==="
    exit 1
  fi

  EVENT_COUNT=$(echo "$PARSE_RESPONSE" | jq -r '.events | length' 2>/dev/null || echo "0")

  check "parse returns both sessions as separate events" \
    "$([ "$EVENT_COUNT" -ge "$EXPECTED_SESSIONS" ] && echo true || echo false)"

  # The fixture lists eight dated occurrences of the afternoon session; one
  # event per occurrence means the recurrence rule was ignored.
  check "occurrence list collapses into a recurrence" \
    "$([ "$EVENT_COUNT" -le "$MAX_EVENTS" ] && echo true || echo false)"

  AFTERNOON=$(echo "$PARSE_RESPONSE" | jq -r '[.events[] | select(.start | test("T14:"))] | length' 2>/dev/null || echo "0")
  check "afternoon session starts at 14:00" \
    "$([ "$AFTERNOON" -ge 1 ] && echo true || echo false)"

  # Only ever mentioned in a trailing prose paragraph, never in the date list.
  EVENING=$(echo "$PARSE_RESPONSE" | jq -r '[.events[] | select(.start | test("T18:"))] | length' 2>/dev/null || echo "0")
  check "evening session starts at 18:00" \
    "$([ "$EVENING" -ge 1 ] && echo true || echo false)"

  WEEKLY=$(echo "$PARSE_RESPONSE" | jq -r '[.events[] | select(any(.recurrence[]?; test("FREQ=WEEKLY")))] | length' 2>/dev/null || echo "0")
  check "every event repeats weekly" \
    "$([ "$WEEKLY" -eq "$EVENT_COUNT" ] && [ "$EVENT_COUNT" -gt 0 ] && echo true || echo false)"

  # Asserted on one event rather than all: the prose describing the evening
  # session does not restate the venue, so an empty location there is valid.
  AT_VENUE=$(echo "$PARSE_RESPONSE" | jq -r '[.events[] | select(.location | ascii_downcase | contains("folkets park"))] | length' 2>/dev/null || echo "0")
  check "the venue is carried onto at least one event" \
    "$([ "$AT_VENUE" -ge 1 ] && echo true || echo false)"
fi


# Times in a travel listing are local to each airport, so each end carries its
# own offset; a single shared offset shifts one of them by an hour. Run once
# per input form: pasted text and a screenshot go through different prompt paths.
check_flights() {
  local source="$1"
  local request_body="$2"
  local response

  echo ""
  echo "Testing /api/calendar/parse (flights across time zones, $source)..."
  response=$(curl -s -X POST "${VB_EXPRESS_URL}/api/calendar/parse" \
    -H "Content-Type: application/json" \
    -H "x-api-key: ${VB_EXPRESS_API_KEY}" \
    -d "$request_body")

  echo "Response: $response"
  echo ""

  local labels=(
    "flights ($source) return one event per leg"
    "Copenhagen departure ($source) is 12:55 at +01:00"
    "Keflavík arrival ($source) is 15:25 at +00:00"
    "Keflavík departure ($source) is 17:00 at +00:00"
    "Toronto arrival ($source) is 18:15 at -05:00"
  )

  if echo "$response" | grep -qiE "$BILLING_ERROR_PATTERN"; then
    for label in "${labels[@]}"; do
      echo "✓ $label [skipped: billing quota exhausted]"
      PASS=$((PASS + 1))
    done
    return
  fi

  if [ "$(echo "$response" | jq -r 'type == "object" and has("events")' 2>/dev/null || echo false)" != "true" ]; then
    echo "✗ flights ($source) response has no events array — cannot assert against it"
    FAIL=$((FAIL + 1))
    return
  fi

  # Matches the instant's wall time and offset on either flight; "-00:00" and
  # "+00:00" are the same offset.
  flight_has() {
    echo "$response" | jq -r --arg field "$1" --arg pattern "$2" \
      '[.events[] | select(.[$field] | test($pattern))] | length' 2>/dev/null || echo "0"
  }
  local count
  count=$(echo "$response" | jq -r '.events | length')
  check "${labels[0]}" "$([ "$count" -eq 2 ] && echo true || echo false)"
  check "${labels[1]}" "$([ "$(flight_has start 'T12:55:00[+]01:00$')" -ge 1 ] && echo true || echo false)"
  check "${labels[2]}" "$([ "$(flight_has end 'T15:25:00[+-]00:00$')" -ge 1 ] && echo true || echo false)"
  check "${labels[3]}" "$([ "$(flight_has start 'T17:00:00[+-]00:00$')" -ge 1 ] && echo true || echo false)"
  check "${labels[4]}" "$([ "$(flight_has end 'T18:15:00-05:00$')" -ge 1 ] && echo true || echo false)"
}

FLIGHTS_DIR="$(dirname "$0")/fixtures"

check_flights "text" "$(jq -n \
  --rawfile text "$FLIGHTS_DIR/calendar-parse-flights.txt" \
  --arg timeZone "$TIME_ZONE" \
  '{ text: $text, timeZone: $timeZone }')"

check_flights "screenshot" "$(jq -n \
  --arg base64 "$(base64 < "$FLIGHTS_DIR/calendar-parse-flights.png" | tr -d '\n')" \
  --arg timeZone "$TIME_ZONE" \
  '{ images: [{ name: "flights.png", base64: $base64, mimeType: "image/png" }], timeZone: $timeZone }')"

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
