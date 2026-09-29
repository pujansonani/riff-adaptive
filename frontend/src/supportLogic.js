function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function evaluateSupportState(features, totalKeys) {
  const backspaceRatio = Number(features?.backspaceRatio || 0);
  const deviationPct = Number(features?.deviationPct || 0);
  const recentAvg = Number(features?.recentAvg || 0);
  const rapidChanges = Number(features?.rapidChanges || 0);

  const evidence = [
    backspaceRatio > 0.16,
    deviationPct > 45,
    recentAvg > 900,
    rapidChanges >= 2,
  ].filter(Boolean).length;

  const confidence = clamp(
    0.1 +
      (backspaceRatio > 0.16 ? 0.24 : 0) +
      (deviationPct > 45 ? 0.24 : 0) +
      (recentAvg > 900 ? 0.16 : 0) +
      (rapidChanges >= 2 ? 0.16 : 0) +
      (evidence >= 2 ? 0.1 : 0),
    0,
    1
  );

  const shouldOffer = totalKeys >= 18 && evidence >= 2 && confidence >= 0.6;

  return {
    confidence,
    shouldOffer,
  };
}
