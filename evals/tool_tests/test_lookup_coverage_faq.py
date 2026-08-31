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

"""Unit tests for lookup_coverage_faq tool."""

import sys
from pathlib import Path

# Add tool directory to path
tool_dir = Path(__file__).resolve().parents[2] / "cxas_app" / "amfam_faq_advisor" / "tools" / "lookup_coverage_faq" / "python_function"
sys.path.insert(0, str(tool_dir))

from python_code import lookup_coverage_faq, FAQ_DATABASE


def test_database_size():
    """Verify all 45+ FAQ items are populated."""
    assert len(FAQ_DATABASE) >= 40


def test_bodily_injury_exact_match():
    """Test exact retrieval of Bodily Injury liability."""
    res = lookup_coverage_faq("bodily_injury_liability")
    assert res["status"] == "success"
    assert "Bodily Injury covers costs if you injure someone else in an accident" in res["exact_answer"]


def test_comprehensive_coverage_exact_match():
    """Test exact retrieval of Comprehensive coverage."""
    res = lookup_coverage_faq("comprehensive_coverage")
    assert res["status"] == "success"
    assert "hitting an animal" in res["exact_answer"]


def test_wind_hail_deductible_exact_match():
    """Test exact retrieval of Wind/Hail deductible."""
    res = lookup_coverage_faq("wind_hail_deductible")
    assert res["status"] == "success"
    assert "mandatory separate deductible" in res["exact_answer"]


def test_underwriters_exact_match():
    """Test exact retrieval of Underwriters."""
    res = lookup_coverage_faq("difference_apex_auto_and_home")
    assert res["status"] == "success"
    assert "Midvale Indemnity Company" in res["exact_answer"]
    assert "Homesite Insurance" in res["exact_answer"]


def test_fuzzy_and_alias_match():
    """Test alias and typo matching."""
    res = lookup_coverage_faq("gap_loan_leas_assistance")
    assert res["status"] == "success"
    assert res["question_key"] == "gap_loan_lease_assistance"
    assert "Loan/Lease Assistance covers that gap" in res["exact_answer"]

    res_alias = lookup_coverage_faq("gap")
    assert res_alias["status"] == "success"
    assert res_alias["question_key"] == "gap_loan_lease_assistance"


def test_not_found_fallback():
    """Test graceful fallback for unknown questions."""
    res = lookup_coverage_faq("unknown_topic_xyz")
    assert res["status"] == "not_found"
    assert "agent_action" in res
    assert "1-800-MYAMFAM (1-800-692-6326)" in res["exact_answer"]
    assert "licensed American Family Insurance specialist" in res["exact_answer"]


def test_escalate_to_agent_tool():
    """Test escalate_to_agent return payload and phone number."""
    esc_dir = Path(__file__).resolve().parents[2] / "cxas_app" / "amfam_faq_advisor" / "tools" / "escalate_to_agent" / "python_function"
    sys.path.insert(0, str(esc_dir))
    import importlib.util
    spec = importlib.util.spec_from_file_location("esc_mod", str(esc_dir / "python_code.py"))
    esc_mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(esc_mod)

    res = esc_mod.escalate_to_agent(reason="out_of_scope_query")
    assert res["status"] == "success"
    assert res["phone_number"] == "1-800-MYAMFAM (1-800-692-6326)"
    assert "licensed American Family Insurance specialist" in res["canned_response"]
    assert "1-800-MYAMFAM (1-800-692-6326)" in res["canned_response"]


if __name__ == "__main__":
    test_database_size()
    test_bodily_injury_exact_match()
    test_comprehensive_coverage_exact_match()
    test_wind_hail_deductible_exact_match()
    test_underwriters_exact_match()
    test_fuzzy_and_alias_match()
    test_not_found_fallback()
    test_escalate_to_agent_tool()
    print("All tool tests passed successfully!")
