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
escalate_to_agent — Human Agent Escalation Tool

PURPOSE:
    Transfers the user session to a licensed American Family Insurance agent
    when the query cannot be resolved via standard FAQ knowledge base or requires
    agent intervention.
"""

from typing import Any, Dict, Optional


def escalate_to_agent(
    reason: str,
    customer_context: str = ""
) -> Dict[str, Any]:
    """Escalates the current session to a human insurance agent.

    Args:
        reason: The reason for the escalation (REQUIRED). Examples:
            'out_of_scope_query', 'customer_requested_agent', 'complex_endorsement_inquiry'.
        customer_context: Optional notes or context regarding the quote.

    Returns:
        dict: Escalation routing confirmation and transfer payload.
    """
    if not reason:
        reason = "General customer assistance request"

    return {
        "status": "success",
        "escalation_status": "transferred",
        "transfer_queue": "amfam_apex_coverage_specialists",
        "phone_number": "1-800-MYAMFAM (1-800-692-6326)",
        "hours_of_operation": "Mon-Fri 8:00 AM - 8:00 PM CST, Sat 8:30 AM - 5:00 PM CST",
        "reason": reason,
        "customer_context": customer_context or "AmFam Digital Coverage Advisor quote assistance",
        "canned_response": "I am connecting you with a licensed American Family Insurance specialist right now to assist you with your specific request. You can also call 1-800-MYAMFAM (1-800-692-6326).",
        "agent_action": "Output the exact canned response VERBATIM: 'I am connecting you with a licensed American Family Insurance specialist right now to assist you with your specific request. You can also call 1-800-MYAMFAM (1-800-692-6326).'",
    }
