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

from typing import Optional


def before_model_callback(callback_context: CallbackContext, llm_request: LlmRequest) -> Optional[LlmResponse]:
    """Intercept session start or trigger actions."""
    # Deterministic greeting on initial session start event
    for part in callback_context.get_last_user_input():
        if part.text == "<event>session start</event>":
            greeting = (
                "Hello! I am your American Family Digital Coverage Advisor. "
                "I can help you understand your auto and home coverages, deductibles, limits, "
                "and bundling discounts. How can I assist you today?"
            )
            return LlmResponse.from_parts(parts=[
                Part.from_text(text=greeting),
            ])

    return None
