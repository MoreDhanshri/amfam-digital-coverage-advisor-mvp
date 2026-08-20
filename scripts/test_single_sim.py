# Copyright 2026 Google LLC
import yaml
from cxas_scrapi.evals.simulation_evals import SimulationEvals
from cxas_scrapi.utils.gemini import GeminiGenerate

app_name = "projects/gecx-amfam/locations/us/apps/amfam-digital-coverage-advisor"
with open("evals/simulations/simulations.yaml") as f:
    test_cases = yaml.safe_load(f)

sim = SimulationEvals(app_name=app_name)
sim.genai_client = GeminiGenerate(
    project_id=sim.project_id,
    location="us-central1",
    credentials=sim.creds,
)

results = sim.run_simulations(
    test_cases=test_cases,
    runs=1,
    parallel=1,
    sim_user_model="gemini-2.5-flash",
    eval_model="gemini-2.5-flash",
    verbose=True,
)

print("\n--- SIMULATION SUMMARY ---")
for r in results:
    name = r.get("name", "unnamed")
    passed = r.get("passed", False)
    goals = r.get("goals", "")
    expectations = r.get("expectations", "")
    turns = r.get("turns", 0)
    duration = r.get("duration_s", 0)
    print(f"Simulation: {name:42} | Passed: {str(passed):5} | Goals: {goals} | Expectations: {expectations} | Turns: {turns} | {duration}s")
