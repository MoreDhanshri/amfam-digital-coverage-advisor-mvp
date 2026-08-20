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

"""Runner script for local simulations against the deployed CXAS app."""

import yaml
from cxas_scrapi.evals.simulation_evals import SimulationEvals


def main():
    app_name = "projects/gecx-amfam/locations/us/apps/amfam-digital-coverage-advisor"
    sim_file = "evals/simulations/simulations.yaml"
    
    print(f"Loading simulation tests from {sim_file}...")
    with open(sim_file, "r") as f:
        test_cases = yaml.safe_load(f)

    print(f"Loaded {len(test_cases)} simulation test case(s). Running against {app_name}...")
    sim_evals = SimulationEvals(app_name=app_name)
    results = sim_evals.run_simulations(
        test_cases=test_cases,
        runs=1,
        parallel=2,
        verbose=True,
    )

    print("\n--- SIMULATION RESULTS ---")
    for r in results:
        name = r.get("test_name", "unnamed")
        status = r.get("status", "UNKNOWN")
        passed = r.get("passed", False)
        print(f"Test: {name} | Status: {status} | Passed: {passed}")
        if not passed and "expectations" in r:
            print("  Expectation details:", r.get("expectations"))


if __name__ == "__main__":
    main()
