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

"""Unit tests for after_model_callback guardrail."""

import sys
from pathlib import Path
import pytest

from cxas_scrapi.utils.callback_libs import (
    CallbackContext,
    Event,
    Content,
    Part,
    FunctionCall,
    FunctionResponse,
    LlmResponse,
)

cb_dir = Path(__file__).resolve().parents[1] / "cxas_app" / "amfam_faq_advisor" / "agents" / "root_agent" / "after_model_callbacks" / "after_model_callbacks_01"
sys.path.insert(0, str(cb_dir))

import builtins
for cls in (CallbackContext, Event, Content, Part, FunctionCall, FunctionResponse, LlmResponse):
    setattr(builtins, cls.__name__, cls)

import importlib.util
spec = importlib.util.spec_from_file_location("cb_mod", str(cb_dir / "python_code.py"))
cb_mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cb_mod)
after_model_callback = cb_mod.after_model_callback


def test_callback_enforces_exact_faq_answer():
    """Verify that when lookup_coverage_faq succeeds, the callback replaces any drifted text with exact answer."""
    exact_ans = "Bodily Injury covers costs if you injure someone else in an accident."
    
    # Tool response event in context
    fn_resp_part = Part(
        function_response=FunctionResponse(
            name="lookup_coverage_faq",
            response={"status": "success", "exact_answer": exact_ans}
        )
    )
    event = Event(
        id="evt-1",
        author="agent",
        timestamp=1000,
        invocationId="inv-1",
        content=Content(role="agent", parts=[fn_resp_part])
    )
    ctx = CallbackContext(events=[event])
    
    # Model generates some conversational drifted response
    llm_resp = LlmResponse(
        content=Content(
            role="model",
            parts=[Part.from_text(text="Sure, here is the bodily injury info: Bodily Injury covers costs...")]
        )
    )
    
    result = after_model_callback(ctx, llm_resp)
    assert result is not None
    assert result.content.parts[0].text == exact_ans


def test_callback_enforces_canned_response_on_escalate():
    """Verify that when escalate_to_agent is invoked, the canned response is strictly enforced."""
    # Tool response event in context
    fn_resp_part = Part(
        function_response=FunctionResponse(
            name="escalate_to_agent",
            response={"status": "success", "escalation_status": "transferred"}
        )
    )
    event = Event(
        id="evt-2",
        author="agent",
        timestamp=2000,
        invocationId="inv-2",
        content=Content(role="agent", parts=[fn_resp_part])
    )
    ctx = CallbackContext(events=[event])
    
    # Model generates some arbitrary text
    llm_resp = LlmResponse(
        content=Content(
            role="model",
            parts=[Part.from_text(text="I will transfer you now. Please hold on.")]
        )
    )
    
    result = after_model_callback(ctx, llm_resp)
    assert result is not None
    expected_canned = "I am connecting you with a licensed American Family Insurance specialist right now to assist you with your specific request. You can also call 1-800-MYAMFAM (1-800-692-6326)."
    assert result.content.parts[0].text == expected_canned


def test_callback_enforces_canned_response_on_not_found():
    """Verify that when lookup_coverage_faq returns not_found, canned response is enforced."""
    fn_resp_part = Part(
        function_response=FunctionResponse(
            name="lookup_coverage_faq",
            response={"status": "not_found"}
        )
    )
    event = Event(
        id="evt-3",
        author="agent",
        timestamp=3000,
        invocationId="inv-3",
        content=Content(role="agent", parts=[fn_resp_part])
    )
    ctx = CallbackContext(events=[event])
    
    llm_resp = LlmResponse(
        content=Content(
            role="model",
            parts=[Part.from_text(text="Sorry I don't know that.")]
        )
    )
    
    result = after_model_callback(ctx, llm_resp)
    assert result is not None
    expected_canned = "I am connecting you with a licensed American Family Insurance specialist right now to assist you with your specific request. You can also call 1-800-MYAMFAM (1-800-692-6326)."
    assert result.content.parts[0].text == expected_canned


def test_callback_enforces_farewell_on_end_session():
    """Verify farewell text on silent end_session."""
    ctx = CallbackContext(events=[])
    llm_resp = LlmResponse(
        content=Content(
            role="model",
            parts=[Part(function_call=FunctionCall(name="end_session", args={}))]
        )
    )
    
    result = after_model_callback(ctx, llm_resp)
    assert result is not None
    assert result.content.parts[0].text == cb_mod.FAREWELL_TEXT


def test_callback_converts_direct_escalation_text_to_tool_call():
    """Verify that if model generated escalation text directly without calling escalate_to_agent, it is converted to a tool call."""
    ctx = CallbackContext(events=[])
    llm_resp = LlmResponse(
        content=Content(
            role="model",
            parts=[Part.from_text(text="I am connecting you with a licensed American Family Insurance specialist right now to assist you.")]
        )
    )
    
    result = after_model_callback(ctx, llm_resp)
    assert result is not None
    assert len(result.content.parts) == 1
    part = result.content.parts[0]
    assert hasattr(part, "function_call") and part.function_call is not None
    assert part.function_call.name == "escalate_to_agent"
    assert part.function_call.args == {"reason": "out_of_scope_query"}

