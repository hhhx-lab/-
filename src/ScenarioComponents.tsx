import React from 'react';
import { Product, ScenarioType } from './types';
import { TaskScenario } from './scenarios/TaskScenario';
import { SocialScenario } from './scenarios/SocialScenario';
import { TreasureScenario } from './scenarios/TreasureScenario';
import { BundleScenario } from './scenarios/BundleScenario';
import { PointsScenario } from './scenarios/PointsScenario';
import { CustomScenario } from './scenarios/CustomScenario';
import { BargainScenario } from './scenarios/BargainScenario';
import { CheckinScenario } from './scenarios/CheckinScenario';

interface ScenarioProps {
  product: Product;
  onUpdatePrice: (price: number, metrics?: any) => void;
  onOverlayAction?: (action: any) => void; 
}

export const ScenarioComponents: Record<ScenarioType, React.FC<ScenarioProps>> = {
  TASK: TaskScenario,
  SOCIAL: SocialScenario,
  TREASURE: TreasureScenario,
  BUNDLE: BundleScenario,
  POINTS: PointsScenario,
  CUSTOM: CustomScenario,
  BARGAIN: BargainScenario,
  CHECKIN: CheckinScenario,
};
