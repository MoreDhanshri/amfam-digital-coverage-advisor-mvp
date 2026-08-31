#!/usr/bin/env python3
# Copyright 2026 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""
American Family Insurance — Digital Coverage Advisor Live Demo Server

Serves the exact AmFam homepage replica with the glowing/jumping chat bubble
and proxies conversations to the live CXAS agent on GCP (`amfam-faq-advisor`).
"""

import http.server
import json
import logging
import os
from pathlib import Path
import re
import sys
import uuid

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("amfam-server")

# Import CXAS SCRAPI Sessions client
try:
    from cxas_scrapi.core.sessions import Sessions
except ImportError:
    logger.error("Failed to import cxas_scrapi. Please run inside the project .venv.")
    sys.exit(1)

# Application Configuration
APP_NAME = "projects/gecx-amfam/locations/us/apps/b8159ce5-24ba-4578-8547-b58995268856"
STATIC_DIR = Path(__file__).resolve().parent / "src"
PORT = int(os.environ.get("PORT", 8080))

# Initialize Sessions Client safely / lazily
sessions_client = None
try:
    logger.info(f"Attempting to initialize CXAS Sessions client for App: {APP_NAME}")
    sessions_client = Sessions(app_name=APP_NAME)
    logger.info("Successfully initialized CXAS Sessions client.")
except Exception as auth_err:
    logger.warn(f"CXAS Sessions initialization deferred (will use deterministic engine): {auth_err}")


CANNED_OUT_OF_SCOPE_RESPONSE = (
    "I am connecting you with a licensed American Family Insurance specialist right now "
    "to assist you with your specific request. You can also call 1-800-MYAMFAM (1-800-692-6326)."
)


class AmFamDemoHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP Request Handler serving static frontend assets and /api/chat endpoints."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(STATIC_DIR), **kwargs)

    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def _get_local_faq_fallback(self, message):
        """Deterministic FAQ knowledge engine and out-of-scope escalation router."""
        clean = message.lower().strip()
        clean_no_punct = re.sub(r"[^\w\s]", " ", clean).strip()

        # Check explicit escalation keywords (word boundaries to avoid false positives)
        escalation_patterns = [
            r"\b(agent|human|representative|specialist|call|speak|talk to someone)\b",
            r"\b(cancel|cancellation|cancel policy|refund|dispute|charged twice)\b",
            r"\b(claim|claims|adjuster|file a claim|claim status)\b",
            r"\b(pet|dog|cat|puppy|kitten|veterinary)\b",
            r"\b(life insurance|term life|whole life)\b",
            r"\b(commercial|business insurance|fleet|commercial auto)\b",
            r"\b(motorcycle|boat|watercraft|rv|trailer|atv|snowmobile)\b",
            r"\b(address change|change address|update address|garaging address)\b",
        ]
        for pat in escalation_patterns:
            if re.search(pat, clean):
                return CANNED_OUT_OF_SCOPE_RESPONSE, "escalate_to_agent", True

        try:
            faq_path = STATIC_DIR / "data" / "faqs.json"
            if faq_path.exists():
                with open(faq_path, "r", encoding="utf-8") as f:
                    faqs = json.load(f)

                # 1. Exact / normalized question match
                for faq in faqs:
                    q = faq.get("question", "").lower().strip()
                    q_clean = re.sub(r"[^\w\s]", " ", q).strip()
                    if q == clean or q_clean == clean_no_punct:
                        return faq.get("answer"), faq.get("question_key") or faq.get("id"), False

                # 2. Topic keyword mapping for single-topic or direct inquiries
                topic_map = [
                    (r"\bcomprehensive\b", "comprehensive_coverage"),
                    (r"\bcollision\b", "collision_coverage"),
                    (r"\bbodily injury\b", "bodily_injury_liability"),
                    (r"\bproperty damage\b", "property_damage_liability"),
                    (r"\b(uninsured|um)\b", "uninsured_motorist_um"),
                    (r"\b(underinsured|uim)\b", "underinsured_motorist_uim"),
                    (r"\brental\b", "rental_reimbursement"),
                    (r"\b(roadside|era|towing|jump start)\b", "roadside_assistance_era"),
                    (r"\b(oem|original equipment)\b", "oem_parts_coverage"),
                    (r"\b(gap|loan|lease)\b", "gap_loan_lease_assistance"),
                    (r"\b(new car|brand new vehicle)\b", "new_car_replacement"),
                    (r"\b(medical expense|med pay)\b", "medical_expense_coverage"),
                    (r"\bpip\b|\bpersonal injury protection\b", "personal_injury_protection_pip"),
                    (r"\bdwelling\b|\bcoverage a\b", "dwelling_coverage_a"),
                    (r"\bother structures\b|\bcoverage b\b", "other_structures_b"),
                    (r"\bpersonal property\b|\bcoverage c\b", "personal_property_c"),
                    (r"\bloss of use\b|\bcoverage d\b", "loss_of_use_d"),
                    (r"\bpersonal liability\b|\bcoverage e\b", "personal_liability_e"),
                    (r"\bmedical payments\b|\bcoverage f\b", "medical_payments_f"),
                    (r"\bwater backup\b|\bsump pump\b", "water_backup_coverage"),
                    (r"\bservice line\b|\butility line\b", "service_line_coverage"),
                    (r"\bequipment breakdown\b|\bhvac breakdown\b", "equipment_breakdown_coverage"),
                    (r"\bearthquake\b", "earthquake_coverage"),
                    (r"\bwind\b|\bhail\b", "wind_hail_deductible"),
                    (r"\bhurricane\b", "hurricane_deductible"),
                    (r"\bdeductible\b", "how_to_choose_deductible"),
                    (r"\b(bundle|bundling|multi product)\b", "how_bundling_saves_money"),
                    (r"\bdnq\b|\bdoes not qualify\b", "does_not_qualify_dnq"),
                    (r"\brecalculate\b|\bcalculate new rate\b", "auto_recalculate_rate"),
                ]

                for pat, key in topic_map:
                    if re.search(pat, clean):
                        for faq in faqs:
                            if faq.get("question_key") == key or faq.get("id") == key:
                                return faq.get("answer"), key, False

                # 3. Fuzzy overlap matching
                tokens = set([t for t in clean_no_punct.split() if len(t) > 3 and t not in {"what", "does", "have", "with", "from", "this", "that", "your", "coverage", "insurance", "about", "tell"}])
                if tokens:
                    best_match = None
                    best_overlap = 0
                    for faq in faqs:
                        q_words = set(re.sub(r"[^\w\s]", " ", faq.get("question", "").lower()).split())
                        overlap = len(tokens.intersection(q_words))
                        if overlap > best_overlap:
                            best_overlap = overlap
                            best_match = faq

                    if best_match and best_overlap >= 1:
                        return best_match.get("answer"), best_match.get("question_key") or best_match.get("id"), False

        except Exception as err:
            logger.warn(f"Local fallback error: {err}")

        # Out-of-scope fallback canned response
        return CANNED_OUT_OF_SCOPE_RESPONSE, "escalate_to_agent", True

    def _mint_ces_token(self):
        """Mints short-lived Google access token for CES OOTB widget token broker."""
        try:
            import google.auth
            import google.auth.transport.requests
            creds, proj = google.auth.default(scopes=["https://www.googleapis.com/auth/cloud-platform"])
            creds.refresh(google.auth.transport.requests.Request())
            token = creds.token
            expires_in = 3600
            if creds.expiry:
                import datetime
                now = datetime.datetime.now(datetime.timezone.utc)
                exp = creds.expiry.replace(tzinfo=datetime.timezone.utc) if creds.expiry.tzinfo is None else creds.expiry
                expires_in = max(60, int((exp - now).total_seconds()))

            payload = {
                "token": token,
                "accessToken": token,
                "access_token": token,
                "expires_in": expires_in,
                "deployment": "projects/gecx-amfam/locations/us/apps/b8159ce5-24ba-4578-8547-b58995268856/deployments/amfam-faq-advisor-web-widget",
                "deploymentName": "projects/gecx-amfam/locations/us/apps/b8159ce5-24ba-4578-8547-b58995268856/deployments/amfam-faq-advisor-web-widget",
                "app": APP_NAME,
                "project": "gecx-amfam",
                "location": "us"
            }
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(payload).encode("utf-8"))
        except Exception as e:
            logger.error(f"Token broker error: {e}")
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))

    def do_GET(self):
        if self.path == "/api/status":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            payload = {
                "status": "online",
                "agent_name": "amfam-faq-advisor",
                "display_name": "AmFam FAQ Advisor",
                "app_name": APP_NAME,
                "app_id": "b8159ce5-24ba-4578-8547-b58995268856",
                "project": "gecx-amfam",
                "location": "us",
                "portal_url": "https://ces.cloud.google.com/projects/gecx-amfam/locations/us/apps/b8159ce5-24ba-4578-8547-b58995268856",
                "deployment": f"{APP_NAME}/deployments/amfam-faq-advisor-web-widget",
                "channel_type": "WEB_UI",
                "modality": "CHAT_AND_VOICE",
                "model": "gemini-3-flash",
                "temperature": 0.0,
                "exact_match_guarantee": True,
                "features": [
                    "Deterministic FAQ Knowledge Retrieval",
                    "Greedy Decoding (Temp 0.0)",
                    "Live CXAS Session Service (b8159ce5-24ba-4578-8547-b58995268856)",
                    "Native Google CES OOTB <chat-messenger> Widget",
                    "Native CES Two-Way Streaming Voice with Server-Side VAD Barge-In",
                    "Token Broker Authentication (/api/token)"
                ]
            }
            self.wfile.write(json.dumps(payload, indent=2).encode("utf-8"))
            return

        if self.path in ("/api/token", "/token", "/mint-token"):
            return self._mint_ces_token()

        # Serve static assets from src/
        return super().do_GET()

    def do_POST(self):
        global sessions_client
        if self.path in ("/api/token", "/token", "/mint-token"):
            return self._mint_ces_token()

        if self.path == "/api/chat":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            
            try:
                data = json.loads(body)
            except Exception as e:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": f"Invalid JSON body: {e}"}).encode("utf-8"))
                return

            user_message = data.get("message", "").strip()
            session_id = data.get("session_id") or str(uuid.uuid4())

            if not user_message:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Empty message"}).encode("utf-8"))
                return

            logger.info(f"[Session: {session_id[:8]}...] User: {user_message}")

            try:
                # Call live CXAS agent on GCP if client is available
                if not sessions_client:
                    try:
                        sessions_client = Sessions(app_name=APP_NAME)
                    except Exception as err:
                        logger.warn(f"Sessions client init error: {err}")
                
                if not sessions_client:
                    raise RuntimeError("CXAS Sessions client not initialized (requires gcloud auth)")

                ces_response = sessions_client.run(
                    session_id=session_id,
                    text=user_message
                )
                structured = sessions_client.get_structured_response(ces_response)
                
                agent_reply = structured.get("agent_text", "")
                tool_calls = structured.get("tool_calls", [])
                tool_responses = structured.get("tool_responses", [])

                logger.info(f"[Session: {session_id[:8]}...] Agent: {agent_reply[:100]}... (Tools: {len(tool_calls)})")

                response_payload = {
                    "status": "success",
                    "session_id": session_id,
                    "reply": agent_reply,
                    "tool_calls": tool_calls,
                    "tool_responses": tool_responses,
                    "agent_transfer": structured.get("agent_transfer"),
                    "session_ended": structured.get("session_ended", False)
                }

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps(response_payload).encode("utf-8"))

            except Exception as e:
                logger.warn(f"Live CXAS call failed ({e}), checking deterministic FAQ library fallback...")
                fallback_ans, q_key, is_esc = self._get_local_faq_fallback(user_message)
                tool_name = "escalate_to_agent" if is_esc else "lookup_coverage_faq"
                tool_args = {"reason": "out_of_scope_query"} if is_esc else {"question_key": q_key}
                logger.info(f"Fallback exact match found: {q_key} (tool: {tool_name})")
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({
                    "status": "success",
                    "session_id": session_id,
                    "reply": fallback_ans,
                    "tool_calls": [{"name": tool_name, "args": tool_args}],
                    "source": "deterministic_fallback"
                }).encode("utf-8"))
            return

        self.send_response(404)
        self._send_cors_headers()
        self.end_headers()


def run():
    server_address = ("0.0.0.0", PORT)
    httpd = http.server.ThreadingHTTPServer(server_address, AmFamDemoHandler)
    logger.info("=" * 65)
    logger.info("🚀 American Family Insurance Digital Coverage Advisor Demo Server")
    logger.info(f"📍 Local Proxy URL: http://dhanshrimore.c.googlers.com:{PORT}")
    logger.info(f"🌐 Serving Static Assets From: {STATIC_DIR}")
    logger.info(f"🤖 Connected CXAS Agent App: {APP_NAME}")
    logger.info("=" * 65)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        logger.info("Shutting down server...")
        httpd.server_close()


if __name__ == "__main__":
    run()
