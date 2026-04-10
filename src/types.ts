export interface StrategicMemory {
  id?: number;
  user_id: string;
  industry_key: string;
  last_win_prob: number;
  last_factors: string;
  update_time?: string;
}

export interface Factor {
  name: string;
  weight: number;
  score: number;
  description: string;
}

export interface BCGPoint {
  name: string;
  x: number; // Market Share (0-1)
  y: number; // Market Growth (0-1)
}

export interface Intelligence {
  redForce: {
    title: string;
    items: string[];
  };
  blueForce: {
    title: string;
    items: string[];
  };
}

export interface RoadmapStep {
  phase: string;
  action: string;
  timeline: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface MMMBreakdown {
  base: number;
  policyUplift: number;
  compDrag: number;
}

export interface Variance {
  delta: number;
  reason: string;
}

export interface AnalysisResult {
  winProbability: number;
  mmmBreakdown?: MMMBreakdown;
  variance?: Variance;
  factors: Factor[];
  bcgPoints?: BCGPoint[];
  intelligence?: Intelligence;
  roadmap?: RoadmapStep[];
  risks: string[];
  recommendations: string[];
  summary: string;
  divergentReminder?: string;
  isDivergent?: boolean;
}

export type Phase = 0 | 1 | 2 | 3;
