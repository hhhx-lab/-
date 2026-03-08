export type Mode = 'A' | 'B';
export type ExperimentOrder = 'AB' | 'BA';

export type ScenarioType = 
  | 'TASK'       // 场景一：阶梯式任务省
  | 'SOCIAL'     // 场景二：社交组队省
  | 'TREASURE'   // 场景三：限时寻宝省
  | 'BUNDLE'     // 场景四：品类攒单省
  | 'POINTS'     // 场景五：积分兑换省
  | 'CUSTOM'     // 场景六：个性化定制省
  | 'BARGAIN'    // 场景七：反向砍价省
  | 'CHECKIN';   // 场景八：每日打卡省

export interface Product {
  id: string;
  name: string;
  image: string;
  originalPrice: number;
  discountedPrice: number;
  category: string;
  description?: string;
}

export interface TaskScenarioMetrics {
  step1_collect_time?: number;
  step2_browse_time?: number;
  step2_browse_count?: number;
  step3_share_time?: number;
  step3_questionnaire_time?: number;
  abandon_step?: number;
  total_time: number;
}

export interface SocialScenarioMetrics {
  create_team_time?: number;
  invite_count: number;
  team_size: number;
  is_success: boolean;
  wait_time: number;
}

export interface TreasureScenarioMetrics {
  egg1_time?: number;
  egg2_time?: number;
  egg3_time?: number;
  total_eggs: number;
  total_time: number;
  click_count: number;
}

export interface BundleScenarioMetrics {
  core_select_time?: number;
  addon_view_time?: number;
  bundle_count: number;
  total_savings: number;
  total_time: number;
}

export interface PointsScenarioMetrics {
  initial_points: number;
  earned_points: number;
  tasks_completed: string[];
  redeemed_points: number;
  total_time: number;
}

export interface CustomScenarioMetrics {
  selected_options: string[];
  toggle_count: number;
  final_discount_rate: number;
  total_time: number;
}

export interface BargainScenarioMetrics {
  slash_count: number;
  share_count: number;
  final_slashed_amount: number;
  total_time: number;
}

export interface CheckinScenarioMetrics {
  days_checked: number;
  fast_forward_used: boolean;
  total_time: number;
}

export interface ModeData {
  decisionTime: number; // ms
  purchaseIntent: boolean;
  emotion: number; // 1-5
  satisfaction: number; // 0-10
  achievement: number; // 1-7
  interactionCount?: number; // For Mode B
  scenarioMetrics?: TaskScenarioMetrics | SocialScenarioMetrics | TreasureScenarioMetrics | BundleScenarioMetrics | PointsScenarioMetrics | CustomScenarioMetrics | BargainScenarioMetrics | CheckinScenarioMetrics | any; // Scenario specific metrics
}

export interface ComparisonData {
  achievementPreference: 'A' | 'B' | 'None';
  satisfactionPreference: 'A' | 'B' | 'None';
  behavioralPreference: 'A' | 'B' | 'None';
  scenarioSpecificPreference?: 'A' | 'B' | 'None'; // Keeping for type compatibility, but may not be used
  customSelection?: string; // New: For scenario-specific multiple choice questions
  feedback: string;
}

export interface ExperimentState {
  step: 'INTRO' | 'PHASE1' | 'MEASURE1' | 'PHASE2' | 'MEASURE2' | 'COMPARISON' | 'END';
  order: ExperimentOrder;
  currentScenario: ScenarioType; // New: Current active scenario
  selectedProducts?: [Product, Product];
  modeAData?: ModeData;
  modeBData?: ModeData;
  comparisonData?: ComparisonData;
}
