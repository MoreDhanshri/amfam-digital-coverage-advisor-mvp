# Copyright 2026 Google LLC
import os
import sys
from unittest.mock import MagicMock

sys.path.insert(0, os.path.join(
    os.path.dirname(__file__),
    "..", "..", "..", "..", "agents", "root_advisor",
    "before_model_callbacks", "before_model",
))

import python_code  # noqa: E402
python_code.tools = MagicMock()
python_code.StatusError = Exception

from cxas_scrapi.utils.callback_libs import CallbackContext, Content, Event, LlmRequest, Part  # noqa: E402
from python_code import before_model_callback  # noqa: E402


def test_session_start_greeting():
    ev = Event(
        id="1",
        author="user",
        timestamp=1000,
        invocationId="inv-1",
        content=Content(role="user", parts=[Part.from_text(text="<event>session start</event>")])
    )
    ctx = CallbackContext(state={}, events=[ev])
    req = LlmRequest()
    res = before_model_callback(ctx, req)
    assert res is not None
    assert "Digital Coverage Advisor" in res.content.parts[0].text


def test_normal_user_query_passes_through():
    ev = Event(
        id="1",
        author="user",
        timestamp=1000,
        invocationId="inv-1",
        content=Content(role="user", parts=[Part.from_text(text="What is bodily injury?")])
    )
    ctx = CallbackContext(state={}, events=[ev])
    req = LlmRequest()
    res = before_model_callback(ctx, req)
    assert res is None
