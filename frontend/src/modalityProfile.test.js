import test from "node:test";
import assert from "node:assert/strict";
import {
  loadModalityProfile,
  recordModalityOutcome,
  getModalityInsights,
  MODALITIES,
} from "./modalityProfile.js";

test("loadModalityProfile initializes default modalities", () => {
  const profile = loadModalityProfile();
  for (const mod of MODALITIES) {
    assert.ok(profile[mod]);
    assert.ok(profile[mod].affinity >= 0);
  }
});

test("recordModalityOutcome increases affinity when reward is high", () => {
  let profile = loadModalityProfile();
  const initialAffinity = profile.visual.affinity;
  
  profile = recordModalityOutcome(profile, "visual", 1.0);
  assert.ok(profile.visual.affinity >= initialAffinity);
  assert.equal(profile.visual.pulls, 2);
});

test("getModalityInsights ranks the top modality correctly", () => {
  let profile = loadModalityProfile();
  profile = recordModalityOutcome(profile, "interactive", 1.2);
  profile = recordModalityOutcome(profile, "interactive", 1.1);

  const insights = getModalityInsights(profile);
  assert.equal(insights.topModality, "interactive");
  assert.ok(insights.ranked.length === MODALITIES.length);
});
