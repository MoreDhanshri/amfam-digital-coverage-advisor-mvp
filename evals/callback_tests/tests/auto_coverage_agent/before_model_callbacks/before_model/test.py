# Copyright 2026 Google LLC
import os
import sys
from unittest.mock import MagicMock

sys.path.insert(0, os.path.join(
    os.path.dirname(__file__),
    "..", "..", "..", "..", "agents", "auto_coverage_agent",
    "before_model_callbacks", "before_model",
))

import python_code  # noqa: E402
python_code.tools = MagicMock()
python_code.StatusError = Exception

from cxas_scrapi.utils.callback_libs import CallbackContext, LlmRequest  # noqa: E402
from python_code import before_model_callback  # noqa: E402


def test_auto_coverage_sets_current_topic():
    ctx = CallbackContext(state={})
    req = LlmRequest()
    res = before_model_callback(ctx, req)
    assert res is None
    assert ctx.state.get("current_topic") == "auto_coverage"
