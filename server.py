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

# Initialize Sessions Client
logger.info(f"Initializing CXAS Sessions client for App: {APP_NAME}")
sessions_client = Sessions(app_name=APP_NAME)


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

    def do_GET(self):
        if self.path == "/api/status":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            payload = {
                "status": "online",
                "agent_name": "amfam-faq-advisor",
                "app_name": APP_NAME,
                "app_id": "b8159ce5-24ba-4578-8547-b58995268856",
                "project": "gecx-amfam",
                "location": "us",
                "model": "gemini-3-flash",
                "temperature": 0.0,
                "exact_match_guarantee": True,
                "features": [
                    "Deterministic FAQ Knowledge Retrieval",
                    "Greedy Decoding (Temp 0.0)",
                    "Live CXAS Session Service",
                    "Automated 5s Glowing & Jumping Chat Bubble",
                    "Voice Synthesis Readout"
                ]
            }
            self.wfile.write(json.dumps(payload, indent=2).encode("utf-8"))
            return

        # Serve static assets from src/
        return super().do_GET()

    def do_POST(self):
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
                # Call live CXAS agent on GCP
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
                logger.error(f"Error calling CXAS agent: {e}", exc_info=True)
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({
                    "status": "error",
                    "error": str(e),
                    "session_id": session_id
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
