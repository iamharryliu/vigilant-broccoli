import sys
import json
import Quartz

wanted_ids = set(int(x) for x in sys.argv[1:])
window_list = Quartz.CGWindowListCopyWindowInfo(
    Quartz.kCGWindowListOptionAll, Quartz.kCGNullWindowID
)

result = {}
for window in window_list:
    window_id = window.get("kCGWindowNumber")
    if window_id in wanted_ids:
        result[window_id] = {
            "pid": window.get("kCGWindowOwnerPID"),
            "name": window.get("kCGWindowOwnerName"),
        }

print(json.dumps(result))
