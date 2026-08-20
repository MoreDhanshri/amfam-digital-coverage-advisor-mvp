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

"""Unit tests for AmFam Digital Coverage Advisor callbacks."""

import os
import pytest
from cxas_scrapi.utils.callback_libs import CallbackContext, Event, Part, Content, LlmResponse, LlmRequest


def test_root_advisor_greeting_on_session_start():
    import importlib.util
    path = os.path.abspath("cxas_app/amfam_digital_coverage_advisor/agents/root_advisor/before_model_callbacks/before_model_callbacks_01/python_code.py")
    spec = importlib.util.spec_from_file_location("root_before_model", path)
    module = importlib.util.module_from_spec(spec)
    module.Part = Part
    module.LlmResponse = LlmResponse
    module.CallbackContext = CallbackContext
    module.LlmRequest = LlmRequest
    spec.loader.exec_module(module)

    event = Event(
        id="1",
        author="USER",
        invocationId="1",
        timestamp=1,
        content=Content(role="user", parts=[Part(text="<event>session start</event>")])
    )
    ctx = CallbackContext(events=[event], state={})
    req = LlmRequest(contents=[])
    res = module.before_model_callback(ctx, req)
    assert res is not None
    assert "American Family Digital Coverage Advisor" in res.content.parts[0].text


def test_root_advisor_normal_query_passes_through():
    import importlib.util
    path = os.path.abspath("cxas_app/amfam_digital_coverage_advisor/agents/root_advisor/before_model_callbacks/before_model_callbacks_01/python_code.py")
    spec = importlib.util.spec_from_file_location("root_before_model", path)
    module = importlib.util.module_from_spec(spec)
    module.Part = Part
    module.LlmResponse = LlmResponse
    module.CallbackContext = CallbackContext
    module.LlmRequest = LlmRequest
    spec.loader.exec_module(module)

    event = Event(
        id="1",
        author="USER",
        invocationId="1",
        timestamp=1,
        content=Content(role="user", parts=[Part(text="What is bodily injury?")])
    )
    ctx = CallbackContext(events=[event], state={})
    req = LlmRequest(contents=[])
    res = module.before_model_callback(ctx, req)
    assert res is None
