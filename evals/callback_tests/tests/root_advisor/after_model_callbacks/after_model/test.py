# Copyright 2026 Google LLC
import os
import sys
from unittest.mock import MagicMock

sys.path.insert(0, os.path.join(
    os.path.dirname(__file__),
    "..", "..", "..", "..", "agents", "root_advisor",
    "after_model_callbacks", "after_model",
))

import python_code  # noqa: E402
python_code.tools = MagicMock()
python_code.StatusError = Exception

from cxas_scrapi.utils.callback_libs import CallbackContext, Content, Event, LlmResponse, Part  # noqa: E402
from python_code import after_model_callback  # noqa: E402


def test_after_model_injects_farewell_when_silent_end_session():
    ev = Event(
        id="1",
        author="user",
        timestamp=1000,
        invocationId="inv-1",
        content=Content(role="user", parts=[Part.from_text(text="Goodbye")])
    )
    ctx = CallbackContext(
        state={},
        events=[ev]
    )
    res = LlmResponse.from_parts(parts=[
        Part.from_function_call(name="end_session", args={})
    ])
    new_res = after_model_callback(ctx, res)
    assert new_res is not None
    assert any("American Family Insurance" in p.text_or_transcript() for p in new_res.content.parts if p.text_or_transcript())


def test_after_model_noop_when_text_present():
    ev = Event(
        id="1",
        author="user",
        timestamp=1000,
        invocationId="inv-1",
        content=Content(role="user", parts=[Part.from_text(text="Goodbye")])
    )
    ctx = CallbackContext(
        state={},
        events=[ev]
    )
    res = LlmResponse.from_parts(parts=[
        Part.from_text(text="Have a good day!"),
        Part.from_function_call(name="end_session", args={})
    ])
    new_res = after_model_callback(ctx, res)
    assert new_res is None
