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
set_session_state — State-Setting Tool for AmFam Digital Coverage Advisor
"""


def set_session_state(_action_trigger: str = "",
                      _escalation_reason: str = "",
                      current_topic: str = "") -> dict:
    """Write trigger, escalation, or topic variables to session state.

    Args:
        _action_trigger: Action trigger (e.g., 'escalate', 'farewell').
        _escalation_reason: Reason for escalation (e.g., 'dynamic_rating', 'competitor_comparison').
        current_topic: Topic being discussed (e.g., 'auto_liability', 'home_dwelling').

    Returns:
        dict: Confirmation status of updated variables.
    """
    updated = {}
    if _action_trigger:
        context.state["_action_trigger"] = _action_trigger
        updated["_action_trigger"] = _action_trigger
    if _escalation_reason:
        context.state["_escalation_reason"] = _escalation_reason
        updated["_escalation_reason"] = _escalation_reason
    if current_topic:
        context.state["current_topic"] = current_topic
        updated["current_topic"] = current_topic

    if not updated:
        return {
            "agent_action": "At least one parameter must be provided to set_session_state."
        }

    return {
        "status": "success",
        "updated_variables": updated,
    }
