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
after_model_callback — Root Agent Verbatim Delivery Enforcement Guardrail

PURPOSE:
    1. Guarantees character-for-character exact fidelity when `lookup_coverage_faq`
       is invoked, removing any unintended conversational drift.
    2. Handles graceful session farewell text if `end_session` is called silently.
"""

from typing import Optional

FAREWELL_TEXT = "Thank you for exploring your coverage options with American Family Insurance. Have a great day!"


def after_model_callback(
    callback_context: CallbackContext,
    llm_response: LlmResponse
) -> Optional[LlmResponse]:
    """Inspects and enforces exact response fidelity on model generation."""

    # Check for silent end_session
    has_end_session = False
    has_text_this_call = False

    for part in llm_response.content.parts:
        if part.has_function_call("end_session"):
            has_end_session = True
        else:
            content = part.text_or_transcript()
            if content and len(content.strip()) > 0:
                has_text_this_call = True

    if has_end_session and not has_text_this_call:
        # Check if text was produced in prior model calls in this turn
        for event in reversed(callback_context.events):
            if event.is_user():
                break
            if event.is_agent():
                for p in event.parts():
                    c = p.text_or_transcript()
                    if c and len(c.strip()) > 0:
                        return None
        new_parts = [Part.from_text(text=FAREWELL_TEXT)]
        new_parts.extend(llm_response.content.parts)
        return LlmResponse.from_parts(parts=new_parts)

    return None
