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
CANNED_OUT_OF_SCOPE = "I am connecting you with a licensed American Family Insurance specialist right now to assist you with your specific request. You can also call 1-800-MYAMFAM (1-800-692-6326)."


def after_model_callback(
    callback_context: CallbackContext,
    llm_response: LlmResponse
) -> Optional[LlmResponse]:
    """Inspects and enforces exact response fidelity on model generation."""
    if not llm_response or not llm_response.content:
        return None

    # Check for silent end_session or escalation calls in current response
    has_end_session = False
    has_escalate = False
    has_text_this_call = False

    for part in llm_response.content.parts:
        if part.has_function_call("end_session"):
            has_end_session = True
        elif part.has_function_call("escalate_to_agent"):
            has_escalate = True
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

    # Check if this turn involved escalate_to_agent or a not_found lookup
    is_escalation_turn = has_escalate
    is_not_found = False
    exact_faq_answer = None

    for event in reversed(callback_context.events):
        if event.is_user():
            break
        for p in event.parts():
            if hasattr(p, "function_call") and p.function_call:
                if p.function_call.name == "escalate_to_agent":
                    is_escalation_turn = True
            if hasattr(p, "function_response") and p.function_response:
                fn_name = p.function_response.name
                resp_data = p.function_response.response or {}
                if fn_name == "escalate_to_agent":
                    is_escalation_turn = True
                elif fn_name == "lookup_coverage_faq":
                    if resp_data.get("status") == "not_found":
                        is_not_found = True
                    elif resp_data.get("status") == "success" and "exact_answer" in resp_data:
                        exact_faq_answer = resp_data["exact_answer"]

    # Guardrail: If model generated escalation text directly without invoking escalate_to_agent,
    # convert it into the required escalate_to_agent function call.
    if not has_escalate and not is_escalation_turn and has_text_this_call:
        for part in llm_response.content.parts:
            text = (part.text_or_transcript() or "").lower()
            if "licensed american family insurance specialist" in text or "connecting you with a licensed" in text or "1-800-myamfam" in text:
                return LlmResponse.from_parts(
                    parts=[Part(function_call=FunctionCall(name="escalate_to_agent", args={"reason": "out_of_scope_query"}))]
                )

    # If this is an escalation or not-found turn, enforce exact canned response
    if (is_escalation_turn or is_not_found) and has_text_this_call:
        non_fn_parts = [Part.from_text(text=CANNED_OUT_OF_SCOPE)]
        fn_parts = [p for p in llm_response.content.parts if hasattr(p, "function_call") and p.function_call]
        return LlmResponse.from_parts(parts=non_fn_parts + fn_parts)

    # If an exact FAQ was retrieved, enforce exact verbatim fidelity
    if exact_faq_answer and has_text_this_call:
        non_fn_parts = [Part.from_text(text=exact_faq_answer)]
        fn_parts = [p for p in llm_response.content.parts if hasattr(p, "function_call") and p.function_call]
        return LlmResponse.from_parts(parts=non_fn_parts + fn_parts)

    return None
