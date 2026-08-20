# Copyright 2026 Google LLC
from cxas_scrapi.core.sessions import Sessions

app_name = "projects/gecx-amfam/locations/us/apps/amfam-digital-coverage-advisor"
s = Sessions(app_name=app_name)

res1 = s.run(session_id="test-session-123", text="What do the numbers mean on 100/300 bodily injury?")
print("--- RUN 1 RAW RESPONSE ---")
print(res1)
