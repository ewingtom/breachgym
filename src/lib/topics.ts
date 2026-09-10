/** Fine-grained adaptive-learning topic tags used across lessons and drills. */
export const TOPIC_IDS = [
  "access-vs-acquisition",
  "owner-maintainer",
  "pi-definition",
  "risk-of-harm",
  "encryption-harbor",
  "timing-discovery",
  "timing-determination",
  "ag-threshold",
  "sequencing",
  "multi-state-matrix",
] as const;

export type TopicId = (typeof TOPIC_IDS)[number];

export const TOPIC_LABELS: Record<TopicId, string> = {
  "access-vs-acquisition": "Access vs acquisition",
  "owner-maintainer": "Owner vs maintainer",
  "pi-definition": "PI definition elements",
  "risk-of-harm": "Risk of harm",
  "encryption-harbor": "Encryption safe harbor",
  "timing-discovery": "Discovery clocks",
  "timing-determination": "Determination clocks",
  "ag-threshold": "AG / regulator thresholds",
  "sequencing": "Regulator sequencing",
  "multi-state-matrix": "Multi-state matrix",
};

/** Map legacy coarse module topics → fine tags when item.topics is absent. */
export const COARSE_TOPIC_MAP: Record<string, TopicId[]> = {
  foundations: ["access-vs-acquisition", "owner-maintainer"],
  "personal-information": ["pi-definition"],
  "risk-of-harm": ["risk-of-harm"],
  "safe-harbors": ["encryption-harbor"],
  timing: ["timing-discovery", "timing-determination", "ag-threshold", "sequencing"],
  "multi-state": ["multi-state-matrix"],
  capstone: ["multi-state-matrix", "pi-definition", "encryption-harbor"],
};

export function labelForTopic(topic: string): string {
  if (topic in TOPIC_LABELS) return TOPIC_LABELS[topic as TopicId];
  return topic.replace(/-/g, " ");
}
