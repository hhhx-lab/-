import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ShoppingBag, 
  Ticket, 
  Users, 
  CheckCircle2, 
  ArrowRight,
  BarChart3,
  Heart,
  Trophy,
  LayoutGrid,
  FileText,
  Star,
  Target,
  Lightbulb,
  Download,
  Building2
} from 'lucide-react';
import { ExperimentState, Mode, ModeData, ComparisonData, Product, ScenarioType } from './types';
import { PRODUCTS, EMOJIS, SCENARIOS } from './constants';
import { ScenarioComponents } from './ScenarioComponents';

export default function App() {
  const [state, setState] = useState<ExperimentState>({
    step: 'INTRO',
    order: Math.random() > 0.5 ? 'AB' : 'BA',
    currentScenario: 'TASK' // Default
  });

  const [currentModeData, setCurrentModeData] = useState<Partial<ModeData>>({});
  const startTimeRef = useRef<number>(0);

  // Determine which mode is active based on step and order
  const getActiveMode = (): Mode => {
    if (state.step === 'PHASE1' || state.step === 'MEASURE1') {
      return state.order[0] as Mode;
    }
    return state.order[1] as Mode;
  };

  const activeMode = getActiveMode();
  const isPhase1 = state.step === 'PHASE1' || state.step === 'MEASURE1';
  const currentProduct = state.selectedProducts ? state.selectedProducts[isPhase1 ? 0 : 1] : PRODUCTS[0];

  const handleStart = (scenario: ScenarioType) => {
    // Randomly pick 2 different products
    const shuffled = [...PRODUCTS].sort(() => 0.5 - Math.random());
    const selected: [Product, Product] = [shuffled[0], shuffled[1]];
    
    setState(prev => ({ 
      ...prev, 
      currentScenario: scenario,
      step: 'PHASE1',
      selectedProducts: selected
    }));
    startTimeRef.current = Date.now();
  };

  const handleDecision = (intent: boolean) => {
    const time = Date.now() - startTimeRef.current;
    setCurrentModeData(prev => ({ ...prev, decisionTime: time, purchaseIntent: intent }));
    setState(prev => ({ ...prev, step: isPhase1 ? 'MEASURE1' : 'MEASURE2' }));
  };

  const handleMeasureComplete = (data: Partial<ModeData>) => {
    const fullData = { ...currentModeData, ...data } as ModeData;
    if (isPhase1) {
      setState(prev => ({
        ...prev,
        [activeMode === 'A' ? 'modeAData' : 'modeBData']: fullData,
        step: 'PHASE2'
      }));
      setCurrentModeData({});
      startTimeRef.current = Date.now();
    } else {
      setState(prev => ({
        ...prev,
        [activeMode === 'A' ? 'modeAData' : 'modeBData']: fullData,
        step: 'COMPARISON'
      }));
    }
  };

  const handleComparisonComplete = async (data: ComparisonData) => {
    const finalState = { ...state, comparisonData: data, step: 'END' as const };
    setState(finalState);
    
    // Sync to backend
    try {
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: state.currentScenario,
          orderType: state.order,
          modeA: activeMode === 'A' ? currentModeData : state.modeAData,
          modeB: activeMode === 'B' ? currentModeData : state.modeBData,
          comparison: data
        })
      });
    } catch (e) {
      console.error("Failed to sync data", e);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-indigo-100">
      {/* Progress Bar */}
      {state.step !== 'INTRO' && state.step !== 'END' && (
        <div className="fixed top-0 left-0 w-full h-1 bg-stone-200 z-50">
          <motion.div 
            className="h-full bg-indigo-600"
            initial={{ width: 0 }}
            animate={{ 
              width: `${(Object.keys(state).filter(k => k.includes('Data')).length / 3) * 100}%` 
            }}
          />
        </div>
      )}

      <main className="max-w-2xl mx-auto px-6 py-12 md:py-24">
        <AnimatePresence mode="wait">
          {state.step === 'INTRO' && (
            <IntroView onStart={handleStart} />
          )}

          {(state.step === 'PHASE1' || state.step === 'PHASE2') && (
            <ProductExperience 
              scenario={state.currentScenario}
              mode={activeMode} 
              product={currentProduct} 
              onDecision={handleDecision}
              onUpdateMetrics={(metrics) => setCurrentModeData(prev => ({ ...prev, scenarioMetrics: metrics }))}
            />
          )}

          {(state.step === 'MEASURE1' || state.step === 'MEASURE2') && (
            <MeasurementView 
              mode={activeMode} 
              onComplete={handleMeasureComplete} 
            />
          )}

          {state.step === 'COMPARISON' && (
            <ComparisonView 
              scenario={state.currentScenario}
              onComplete={handleComparisonComplete} 
            />
          )}

          {state.step === 'END' && (
            <EndView state={state} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function IntroView({ onStart }: { onStart: (scenario: ScenarioType) => void }) {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('TASK');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center space-y-8"
    >
      <div className="inline-block p-3 bg-indigo-100 rounded-2xl text-indigo-600 mb-4">
        <BarChart3 size={32} />
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
        Z世代“精致省”<br/><span className="text-indigo-600">消费心理实验</span>
      </h1>
      <p className="text-lg text-stone-600 max-w-md mx-auto leading-relaxed">
        欢迎参加本次实验。请选择一个实验场景，我们将模拟两种不同的购物优惠模式（直接优惠 vs 精致省），请您根据真实的心理感受进行操作。
      </p>
      
      <div className="grid grid-cols-2 gap-3 text-left">
        {(Object.keys(SCENARIOS) as ScenarioType[]).map(key => (
          <button
            key={key}
            onClick={() => setSelectedScenario(key)}
            className={`p-4 rounded-2xl border-2 transition-all ${
              selectedScenario === key 
                ? 'border-indigo-600 bg-indigo-50 text-indigo-900' 
                : 'border-stone-100 bg-white text-stone-600 hover:border-indigo-200'
            }`}
          >
            <div className="font-bold text-sm mb-1">{SCENARIOS[key].title}</div>
            <div className="text-[10px] opacity-70 line-clamp-2">{SCENARIOS[key].description}</div>
          </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200 text-left space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <CheckCircle2 size={18} className="text-green-500" />
          实验须知
        </h3>
        <ul className="text-sm text-stone-500 space-y-2 list-disc pl-5">
          <li>请关注您的心理感受，而非单纯的价格计算。</li>
          <li>实验数据将严格保密，仅用于学术研究。</li>
          <li>当前选择场景：<span className="font-bold text-indigo-600">{SCENARIOS[selectedScenario].title}</span></li>
        </ul>
      </div>

      <button 
        onClick={() => onStart(selectedScenario)}
        className="w-full py-4 bg-stone-900 text-white rounded-2xl font-semibold hover:bg-stone-800 transition-all flex items-center justify-center gap-2 group"
      >
        开始实验
        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );
}

function ProductExperience({ 
  scenario, 
  mode, 
  product, 
  onDecision,
  onUpdateMetrics
}: { 
  scenario: ScenarioType, 
  mode: Mode, 
  product: Product, 
  onDecision: (intent: boolean) => void,
  onUpdateMetrics: (metrics: any) => void
}) {
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes countdown
  const [dynamicPrice, setDynamicPrice] = useState(product.originalPrice);
  const [showFeedback, setShowFeedback] = useState<string | null>(null);

  const isModeB = mode === 'B';
  const themeColor = isModeB ? 'orange' : 'blue';
  const scenarioInfo = SCENARIOS[scenario];
  const ScenarioComponent = ScenarioComponents[scenario];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Reset price when mode changes
  useEffect(() => {
    if (!isModeB) {
      // Mode A: Direct discount to "Ultimate" price
      // We need to define what the "Ultimate" price is for Mode A.
      // In the original code, it was product.discountedPrice.
      // For consistency, let's assume Mode A offers the "Best" price directly.
      // However, the prompt says "B group final price slightly lower than A group".
      // So A group price should be slightly higher than the best B group price.
      // Let's set A group price to product.discountedPrice * 1.05 (5% more expensive than best B)
      // Or just use product.discountedPrice as A price, and allow B to go lower?
      // Let's stick to: A = discountedPrice. B can go lower or equal.
      setDynamicPrice(product.discountedPrice);
    } else {
      // Mode B: Starts at Original Price
      setDynamicPrice(product.originalPrice);
    }
  }, [mode, product]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleScenarioPriceUpdate = (price: number, metrics?: any) => {
    if (isModeB) {
      setDynamicPrice(price);
      if (metrics) {
        onUpdateMetrics(metrics);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full animate-pulse bg-${themeColor}-500`} />
          场景体验：{isModeB ? scenarioInfo.modeBName : scenarioInfo.modeAName}
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md border border-red-100 flex items-center gap-1">
            <BarChart3 size={10} />
            限时抢购 {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-[32px] overflow-hidden shadow-xl shadow-stone-200/50 border border-stone-100">
        <div className="aspect-[16/10] relative overflow-hidden">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <span className="px-3 py-1 bg-black/40 backdrop-blur-md text-white rounded-full text-[10px] font-bold tracking-wider uppercase">
              {product.category}
            </span>
            <span className="px-3 py-1 bg-orange-500/80 backdrop-blur-md text-white rounded-full text-[10px] font-bold">
              热销中
            </span>
          </div>
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl shadow-sm border border-stone-100 text-[10px] font-medium text-stone-600 flex items-center gap-2">
            <Users size={12} className="text-stone-400" />
            当前 1.2k 人正在浏览
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-stone-900 tracking-tight">{product.name}</h2>
              <div className="flex items-baseline gap-3">
                <span className={`text-4xl font-black text-${themeColor}-600 tabular-nums`}>
                  ¥{dynamicPrice}
                </span>
                <span className="text-stone-400 line-through text-sm">
                  原价 ¥{product.originalPrice}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">库存状态</div>
              <div className="flex items-center gap-1">
                <div className="w-16 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-orange-400" />
                </div>
                <span className="text-[10px] font-bold text-orange-600">仅剩 12 件</span>
              </div>
            </div>
          </div>

          {isModeB ? (
            <div className="space-y-4">
              <ScenarioComponent 
                product={product} 
                onUpdatePrice={handleScenarioPriceUpdate} 
              />
            </div>
          ) : (
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-blue-800 text-sm font-medium flex items-center gap-3">
              <CheckCircle2 size={20} className="text-blue-600" />
              <div>
                <div className="font-bold">已自动享受最优优惠</div>
                <div className="text-xs opacity-70">系统已为您直接减免 ¥{product.originalPrice - dynamicPrice}</div>
              </div>
            </div>
          )}

          <div className="pt-4 flex gap-4">
            <button 
              onClick={() => onDecision(true)}
              className={`flex-1 py-4 bg-${themeColor}-600 text-white rounded-2xl font-bold shadow-lg shadow-${themeColor}-200 hover:opacity-90 transition-all`}
            >
              考虑购买
            </button>
            <button 
              onClick={() => onDecision(false)}
              className="px-8 py-4 bg-stone-100 text-stone-500 rounded-2xl font-bold hover:bg-stone-200 transition-all"
            >
              不考虑
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showFeedback && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-stone-900 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-2"
          >
            <CheckCircle2 size={18} className="text-green-400" />
            {showFeedback}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MeasurementView({ mode, onComplete }: { mode: Mode, onComplete: (data: Partial<ModeData>) => void }) {
  const [emotion, setEmotion] = useState<number | null>(null);
  const [satisfaction, setSatisfaction] = useState(5);
  const [achievement, setAchievement] = useState<number | null>(null);
  const [step, setStep] = useState(1);

  const isModeB = mode === 'B';
  const themeColor = isModeB ? 'orange' : 'blue';

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-12"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">心理感受测量</h2>
        <p className="text-stone-500">请根据刚才的体验，如实选择您的感受</p>
      </div>

      <div className="space-y-16">
        {/* Step 1: Emotion */}
        <div className={`space-y-6 transition-opacity ${step < 1 ? 'opacity-20 pointer-events-none' : ''}`}>
          <label className="block text-center font-semibold text-stone-700">1. 您此刻的即时情绪是？</label>
          <div className="flex justify-between max-w-sm mx-auto">
            {EMOJIS.map((emoji, i) => (
              <button
                key={i}
                onClick={() => { setEmotion(i + 1); if(step === 1) setStep(2); }}
                className={`text-4xl p-3 rounded-2xl transition-all ${
                  emotion === i + 1 
                    ? `bg-${themeColor}-100 scale-125` 
                    : 'hover:bg-stone-100 grayscale hover:grayscale-0'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Satisfaction */}
        <div className={`space-y-6 transition-opacity ${step < 2 ? 'opacity-20 pointer-events-none' : ''}`}>
          <label className="block text-center font-semibold text-stone-700">
            2. 对该模式的总体满意度？ ({satisfaction}分)
          </label>
          <div className="px-4">
            <input 
              type="range" 
              min="0" 
              max="10" 
              value={satisfaction}
              onChange={(e) => { setSatisfaction(parseInt(e.target.value)); if(step === 2) setStep(3); }}
              className={`w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-${themeColor}-600`}
            />
            <div className="flex justify-between text-[10px] text-stone-400 mt-2 uppercase tracking-widest">
              <span>非常不满意</span>
              <span>非常满意</span>
            </div>
          </div>
        </div>

        {/* Step 3: Achievement */}
        <div className={`space-y-6 transition-opacity ${step < 3 ? 'opacity-20 pointer-events-none' : ''}`}>
          <label className="block text-center font-semibold text-stone-700">3. 购买过程带来的成就感强度？</label>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
              <button
                key={num}
                onClick={() => setAchievement(num)}
                className={`w-10 h-10 rounded-xl font-bold transition-all ${
                  achievement === num 
                    ? `bg-${themeColor}-600 text-white shadow-lg shadow-${themeColor}-200` 
                    : 'bg-white border border-stone-200 text-stone-400 hover:border-stone-300'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button 
        disabled={!emotion || !achievement}
        onClick={() => onComplete({ emotion: emotion!, satisfaction, achievement: achievement! })}
        className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold disabled:opacity-30 transition-all mt-12"
      >
        完成本阶段
      </button>
    </motion.div>
  );
}

function ComparisonView({ scenario, onComplete }: { scenario: ScenarioType, onComplete: (data: ComparisonData) => void }) {
  const [achievement, setAchievement] = useState<'A' | 'B' | 'None' | null>(null);
  const [satisfaction, setSatisfaction] = useState<'A' | 'B' | 'None' | null>(null);
  const [behavior, setBehavior] = useState<'A' | 'B' | 'None' | null>(null);
  const [customSelection, setCustomSelection] = useState<string>('');
  const [feedback, setFeedback] = useState('');

  const scenarioInfo = SCENARIOS[scenario];

  // Dynamic Configuration based on Scenario
  const getScenarioConfig = () => {
    let title = "综合对比评价";
    let lastQuestionLabel = "您选择该种模式的核心原因是什么：";
    let showCustomOptions = false;
    let customOptions: string[] = [];
    
    // Default questions structure
    let questionsConfig = [
      { 
        id: 'achievement', 
        label: '哪种模式在消费过程中给您带来更高的成就感？', 
        options: [
          { id: 'A', label: scenarioInfo.modeAName },
          { id: 'B', label: scenarioInfo.modeBName },
          { id: 'None', label: '无差异' }
        ],
        icon: <Trophy size={18} />
      },
      { 
        id: 'satisfaction', 
        label: '综合来看，哪种消费的模式让您更为满意（偏好）？', 
        options: [
          { id: 'A', label: scenarioInfo.modeAName },
          { id: 'B', label: scenarioInfo.modeBName },
          { id: 'None', label: '无差异' }
        ],
        icon: <Heart size={18} />
      },
      { 
        id: 'behavior', 
        label: '如果在精致省的选择下商品的实际价到手价格会低于直接优惠的价格，那么您的更偏向于哪一种？', 
        options: [
          { id: 'A', label: scenarioInfo.modeAName },
          { id: 'B', label: scenarioInfo.modeBName },
          { id: 'None', label: '无差异' }
        ],
        icon: <ShoppingBag size={18} />
      }
    ];

    switch (scenario) {
      case 'TASK':
        lastQuestionLabel = "What is the core reason for your choice of this mode:";
        questionsConfig = [
          { 
            id: 'achievement', 
            label: 'Which mode provides a higher sense of accomplishment during the purchasing process?', 
            options: [
              { id: 'A', label: scenarioInfo.modeAName },
              { id: 'B', label: scenarioInfo.modeBName },
              { id: 'None', label: 'No Difference' }
            ],
            icon: <Trophy size={18} />
          },
          { 
            id: 'satisfaction', 
            label: 'Overall, which purchasing mode do you find more satisfactory (preferred)?', 
            options: [
              { id: 'A', label: scenarioInfo.modeAName },
              { id: 'B', label: scenarioInfo.modeBName },
              { id: 'None', label: 'No Difference' }
            ],
            icon: <Heart size={18} />
          },
          { 
            id: 'behavior', 
            label: "If the actual price of the product in the 'Exquisite Savings' mode is lower than direct discounts, which would you prefer?", 
            options: [
              { id: 'A', label: scenarioInfo.modeAName },
              { id: 'B', label: scenarioInfo.modeBName },
              { id: 'None', label: 'No Difference' }
            ],
            icon: <ShoppingBag size={18} />
          }
        ];
        break;

      case 'BARGAIN':
        title = "邀请好友砍价体验反馈";
        lastQuestionLabel = "您认为“砍价”模式最吸引您或最劝退您的点是什么？";
        questionsConfig = [
          { 
            id: 'achievement', 
            label: '在邀请好友砍价的过程中，您更多感受到的是“社交互动的乐趣”还是“欠人情的负担”？', 
            options: [
              { id: 'A', label: '负担 (偏好直接买)' },
              { id: 'B', label: '乐趣 (偏好砍价)' },
              { id: 'None', label: '无明显差异' }
            ],
            icon: <Users size={18} />
          },
          { 
            id: 'satisfaction', 
            label: '考虑到砍价可能失败的不确定性，哪种模式让您心理上更舒适？', 
            options: [
              { id: 'A', label: '直接购买 (确定性)' },
              { id: 'B', label: '尝试砍价 (博弈感)' },
              { id: 'None', label: '无所谓' }
            ],
            icon: <Heart size={18} />
          },
          { 
            id: 'behavior', 
            label: '如果直接购买比砍价后的平均价格贵 5 元，您会选择？', 
            options: [
              { id: 'A', label: '多花5元直接买' },
              { id: 'B', label: '找人砍价省5元' },
              { id: 'None', label: '看情况' }
            ],
            icon: <ShoppingBag size={18} />
          }
        ];
        break;

      case 'SOCIAL':
        title = "拼团/社交购买体验反馈";
        lastQuestionLabel = "在含有多种非直接优惠降价的选择中，您是否会选择组队式？请简单描述选择或不选择理由。";
        questionsConfig = [
          { 
            id: 'achievement', 
            label: '哪种购买完成的瞬间让您觉得“这笔交易更值”？', 
            options: [
              { id: 'A', label: '独立快速下单' },
              { id: 'B', label: '成功组队拼单' },
              { id: 'None', label: '无差异' }
            ],
            icon: <Trophy size={18} />
          },
          { 
            id: 'satisfaction', 
            label: '您更享受哪种购物心理状态？', 
            options: [
              { id: 'A', label: '私密/独立 (不打扰别人)' },
              { id: 'B', label: '互助/共赢 (带朋友一起省)' },
              { id: 'None', label: '无所谓' }
            ],
            icon: <Users size={18} />
          },
          { 
            id: 'behavior', 
            label: '如果拼团能省 10 元，但需要等待陌生人或邀请好友，您会？', 
            options: [
              { id: 'A', label: '直接原价买 (省心)' },
              { id: 'B', label: '发起拼团 (省钱)' },
              { id: 'None', label: '看急不急' }
            ],
            icon: <ShoppingBag size={18} />
          }
        ];
        break;

      case 'BUNDLE':
        title = "凑单满减体验反馈";
        lastQuestionLabel = "如果在平台一次性购买多个物件时，被平台推送购买相关物件的凑单信息，您更偏向于直接凑单还是单独下单之后另外搜索下单？";
        showCustomOptions = true;
        customOptions = ["直接凑单", "单独下单后搜索"];
        questionsConfig = [
          { 
            id: 'achievement', 
            label: '当您成功凑够满减金额时，您的主要感受是？', 
            options: [
              { id: 'A', label: '累/麻烦 (为了省钱而妥协)' },
              { id: 'B', label: '聪明/胜利 (薅到了羊毛)' },
              { id: 'None', label: '无感' }
            ],
            icon: <Trophy size={18} />
          },
          { 
            id: 'satisfaction', 
            label: '您更倾向于哪种决策模式？', 
            options: [
              { id: 'A', label: '只买需要的 (简单)' },
              { id: 'B', label: '买够满减线 (划算)' },
              { id: 'None', label: '看情况' }
            ],
            icon: <Heart size={18} />
          },
          { 
            id: 'behavior', 
            label: '为了凑够 300-50 的优惠，还差 20 元，您会购买一个其实不太需要的 20 元商品吗？', 
            options: [
              { id: 'A', label: '不会 (不买立省100%)' },
              { id: 'B', label: '会 (感觉不凑就亏了)' },
              { id: 'None', label: '看商品' }
            ],
            icon: <ShoppingBag size={18} />
          }
        ];
        break;

      case 'POINTS':
        title = "积分/任务激励体验反馈";
        lastQuestionLabel = "您是否愿意为获取减价神券而登录平台签到或者做任务？";
        showCustomOptions = true;
        customOptions = ["愿意", "不愿意"];
        questionsConfig = [
          { 
            id: 'achievement', 
            label: '通过做任务/签到获得的优惠券，相比直接领取的优惠券，会让您觉得？', 
            options: [
              { id: 'A', label: '更麻烦 (时间成本高)' },
              { id: 'B', label: '更珍贵 (劳动所得)' },
              { id: 'None', label: '没区别' }
            ],
            icon: <Trophy size={18} />
          },
          { 
            id: 'satisfaction', 
            label: '您如何看待购物APP中的小游戏或任务？', 
            options: [
              { id: 'A', label: '干扰/浪费时间' },
              { id: 'B', label: '有趣/顺手赚优惠' },
              { id: 'None', label: '无感' }
            ],
            icon: <Heart size={18} />
          },
          { 
            id: 'behavior', 
            label: '如果看 30 秒广告能获得 1 元无门槛红包，您会看吗？', 
            options: [
              { id: 'A', label: '不会 (时间更值钱)' },
              { id: 'B', label: '会 (积少成多)' },
              { id: 'None', label: '看心情' }
            ],
            icon: <ShoppingBag size={18} />
          }
        ];
        break;

      case 'CUSTOM':
        title = "个性化定制体验反馈";
        lastQuestionLabel = "在个性化定制的模式下，您更偏向于选择什么方式来获取折扣？请简述原因。";
        showCustomOptions = true;
        customOptions = ["优惠券", "拼团", "分享", "限时抢购"];
        questionsConfig = [
          { 
            id: 'achievement', 
            label: '哪种商品让您觉得“价值感”更高？', 
            options: [
              { id: 'A', label: '官方标准版 (大牌感)' },
              { id: 'B', label: '我的定制版 (独特性)' },
              { id: 'None', label: '看价格' }
            ],
            icon: <Trophy size={18} />
          },
          { 
            id: 'satisfaction', 
            label: '在购物过程中，您更享受？', 
            options: [
              { id: 'A', label: '快速决策 (省心)' },
              { id: 'B', label: '参与设计/配置 (掌控感)' },
              { id: 'None', label: '无所谓' }
            ],
            icon: <Heart size={18} />
          },
          { 
            id: 'behavior', 
            label: '定制版比标准版贵 10%，但完全符合您的审美，您会？', 
            options: [
              { id: 'A', label: '买标准版 (性价比)' },
              { id: 'B', label: '买定制版 (悦己)' },
              { id: 'None', label: '犹豫' }
            ],
            icon: <ShoppingBag size={18} />
          }
        ];
        break;

      case 'CHECKIN':
        title = "打卡/连签体验反馈";
        lastQuestionLabel = "您在实际的生活中对于这种减价方式的评价如何：";
        questionsConfig = [
          { 
            id: 'achievement', 
            label: '连续打卡 7 天获得大额优惠，这让您感觉？', 
            options: [
              { id: 'A', label: '被平台绑架了' },
              { id: 'B', label: '很有毅力/成就感' },
              { id: 'None', label: '无感' }
            ],
            icon: <Trophy size={18} />
          },
          { 
            id: 'satisfaction', 
            label: '相比直接打折，这种“坚持才能获得”的优惠模式让您？', 
            options: [
              { id: 'A', label: '更反感 (套路深)' },
              { id: 'B', label: '更珍惜 (沉没成本)' },
              { id: 'None', label: '没区别' }
            ],
            icon: <Heart size={18} />
          },
          { 
            id: 'behavior', 
            label: '如果断签一天会导致奖励清零，您愿意花 2 元购买“补签卡”吗？', 
            options: [
              { id: 'A', label: '不愿意 (放弃奖励)' },
              { id: 'B', label: '愿意 (保住进度)' },
              { id: 'None', label: '看奖励大小' }
            ],
            icon: <ShoppingBag size={18} />
          }
        ];
        break;
      default:
        // TREASURE use default
        break;
    }

    return { title, lastQuestionLabel, showCustomOptions, customOptions, questionsConfig };
  };

  const config = getScenarioConfig();

  const questions = [
    { 
      id: 'achievement', 
      value: achievement, 
      setter: setAchievement,
      ...config.questionsConfig[0]
    },
    { 
      id: 'satisfaction', 
      value: satisfaction, 
      setter: setSatisfaction,
      ...config.questionsConfig[1]
    },
    { 
      id: 'behavior', 
      value: behavior, 
      setter: setBehavior,
      ...config.questionsConfig[2]
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">{config.title}</h2>
        <p className="text-stone-500">最后一步：请直接对比两种模式的感受</p>
      </div>

      <div className="space-y-8">
        {questions.map((q) => (
          <div key={q.id} className="space-y-4">
            <label className="flex items-center gap-2 font-semibold text-stone-700">
              {q.icon}
              {q.label}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {q.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => q.setter(opt.id as any)}
                  className={`py-3 px-2 rounded-xl text-sm font-medium border-2 transition-all ${
                    q.value === opt.id 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                      : 'bg-white border-stone-100 text-stone-500 hover:border-stone-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="space-y-4">
          <label className="block font-semibold text-stone-700 leading-relaxed">
            {config.lastQuestionLabel}
          </label>
          
          {config.showCustomOptions && (
            <div className="flex flex-wrap gap-3 mb-3">
              {config.customOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setCustomSelection(opt)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    customSelection === opt
                      ? 'bg-stone-800 text-white border-stone-800'
                      : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          <textarea 
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="请输入您的想法..."
            className="w-full p-4 bg-white border border-stone-200 rounded-2xl h-32 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      <button 
        disabled={!achievement || !satisfaction || !behavior || (config.showCustomOptions && !customSelection)}
        onClick={() => onComplete({ 
          achievementPreference: achievement!, 
          satisfactionPreference: satisfaction!, 
          behavioralPreference: behavior!,
          customSelection: customSelection,
          feedback 
        })}
        className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold disabled:opacity-30 transition-all"
      >
        提交实验结果
      </button>
    </motion.div>
  );
}

import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

// ... existing imports ...

import { EnterpriseDashboard } from './EnterpriseDashboard';

// ... existing imports ...

function EndView({ state }: { state: ExperimentState }) {
  const [viewMode, setViewMode] = useState<'report' | 'dashboard'>('report');
  const { modeAData, modeBData, comparisonData, currentScenario } = state;
  const scenarioInfo = SCENARIOS[currentScenario];

  if (viewMode === 'dashboard') {
    return <EnterpriseDashboard onBack={() => setViewMode('report')} />;
  }

  // ... existing EndView logic ...


  // --- Data Calculation Helpers ---

  const calculateDimensions = () => {
    // Base scores
    let scores = {
      social: 50,
      game: 50,
      price: 50,
      time: 50,
      risk: 50
    };

    const isB = (val: string | undefined) => val === 'B';

    // Adjust based on Scenario & Answers
    // This is a simplified logic for demonstration. In a real app, this would be more complex.
    switch (currentScenario) {
      case 'BARGAIN':
        if (isB(comparisonData?.achievementPreference)) scores.social += 30; else scores.social -= 10;
        if (isB(comparisonData?.satisfactionPreference)) scores.risk += 30; else scores.risk -= 20;
        if (isB(comparisonData?.behavioralPreference)) { scores.price += 20; scores.time -= 20; } else { scores.price -= 10; scores.time += 20; }
        scores.game += 10;
        break;
      case 'SOCIAL':
        if (isB(comparisonData?.achievementPreference)) scores.social += 30; else scores.social -= 10;
        if (isB(comparisonData?.satisfactionPreference)) scores.social += 20; else scores.social -= 20;
        if (isB(comparisonData?.behavioralPreference)) { scores.price += 20; scores.time -= 20; }
        break;
      case 'TASK':
        if (isB(comparisonData?.achievementPreference)) scores.game += 30; else scores.game -= 10;
        if (isB(comparisonData?.satisfactionPreference)) scores.game += 20;
        if (isB(comparisonData?.behavioralPreference)) { scores.price += 20; scores.time -= 20; }
        break;
      case 'POINTS':
      case 'CHECKIN':
        if (isB(comparisonData?.achievementPreference)) scores.game += 20;
        if (isB(comparisonData?.satisfactionPreference)) scores.game += 20;
        if (isB(comparisonData?.behavioralPreference)) { scores.price += 20; scores.time -= 20; }
        break;
      case 'BUNDLE':
        if (isB(comparisonData?.achievementPreference)) scores.game += 20;
        if (isB(comparisonData?.behavioralPreference)) { scores.price += 30; scores.time -= 10; }
        break;
      case 'CUSTOM':
        if (isB(comparisonData?.achievementPreference)) scores.price -= 10; // Willing to pay more
        if (isB(comparisonData?.satisfactionPreference)) scores.game += 20; // Control
        break;
    }

    return [
      { subject: '社交敏感度', A: scores.social, fullMark: 100 },
      { subject: '游戏化偏好', A: scores.game, fullMark: 100 },
      { subject: '价格敏感度', A: scores.price, fullMark: 100 },
      { subject: '时间敏感度', A: scores.time, fullMark: 100 },
      { subject: '风险承受力', A: scores.risk, fullMark: 100 },
    ];
  };

  const calculatePsychData = () => {
    // Mock Average Data (in a real app, this comes from the backend)
    const avgAchievement = 4.5;
    const avgSatisfaction = 7.2;
    
    // User Data
    const userAchievement = modeBData?.achievement || 0;
    const userSatisfaction = modeBData?.satisfaction || 0;

    return [
      { name: '成就感', user: userAchievement, avg: avgAchievement, max: 7 },
      { name: '满意度', user: userSatisfaction, avg: avgSatisfaction, max: 10 },
    ];
  };

  const radarData = calculateDimensions();
  const psychData = calculatePsychData();

  // --- Report Content Generators ---

  const getPersonaLabel = () => {
    const scores = calculateDimensions();
    const maxScore = scores.reduce((prev, current) => (prev.A > current.A) ? prev : current);
    
    if (maxScore.subject === '社交敏感度') return '社交组队积极者';
    if (maxScore.subject === '游戏化偏好') return '游戏化挑战玩家';
    if (maxScore.subject === '价格敏感度') return '精打细算省钱党';
    if (maxScore.subject === '时间敏感度') return '效率至上行动派';
    if (maxScore.subject === '风险承受力') return '博弈冒险家';
    return '理性平衡消费者';
  };

  const getSuggestions = () => {
    const persona = getPersonaLabel();
    const suggestions = [];

    if (persona.includes('社交')) {
      suggestions.push({ title: '推荐活动', content: '拼多多“砍一刀”、美团“拼好饭”、瑞幸“邀请好友得券”' });
      suggestions.push({ title: '避坑指南', content: '避免参与流程过长且需要单人完成的复杂任务，优先选择可借力的活动。' });
    } else if (persona.includes('游戏')) {
      suggestions.push({ title: '推荐活动', content: '淘宝“叠猫猫”、支付宝“集五福”、京东“炸年兽”' });
      suggestions.push({ title: '避坑指南', content: '注意控制时间投入，避免为了微小优惠消耗过多精力。' });
    } else if (persona.includes('价格')) {
      suggestions.push({ title: '推荐活动', content: '百亿补贴、限时秒杀、临期特卖' });
      suggestions.push({ title: '避坑指南', content: '警惕“凑单陷阱”，不要为了凑满减而购买不需要的商品。' });
    } else if (persona.includes('效率')) {
      suggestions.push({ title: '推荐活动', content: '会员折扣、直接满减、定期购' });
      suggestions.push({ title: '避坑指南', content: '远离需要拉人头或复杂计算的活动，您的时间更值钱。' });
    } else {
      suggestions.push({ title: '推荐活动', content: '品牌会员日、积分兑换' });
      suggestions.push({ title: '避坑指南', content: '保持理性，按需购买。' });
    }
    return suggestions;
  };

  const suggestions = getSuggestions();

  // Reuse existing analysis text logic but simplified for the report card
  const getAnalysisText = () => {
    // ... (Keep the existing logic from previous step, but return just the text)
    // For brevity in this refactor, I'll extract a simple summary based on preference
    if (comparisonData?.behavioralPreference === 'B') {
      return `您倾向于${scenarioInfo.modeBName}，享受其中的过程价值（如社交、游戏、成就感），属于“体验型”消费者。`;
    } else {
      return `您倾向于${scenarioInfo.modeAName}，更看重效率和确定性，属于“结果型”消费者。`;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8 pb-20 max-w-4xl mx-auto print:max-w-none print:p-0"
    >
      {/* Header */}
      <div className="text-center space-y-2 border-b border-stone-200 pb-6">
        <div className="flex items-center justify-center gap-2 text-stone-800 mb-2">
          <FileText size={24} />
          <span className="text-sm font-bold uppercase tracking-widest opacity-60">Commercial Value Report</span>
        </div>
        <h2 className="text-3xl font-bold text-stone-900">用户个体实验报告</h2>
        <p className="text-stone-500">
          实验场景：{scenarioInfo.title} | 生成时间：{new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Module 1: Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center justify-center space-y-2">
          <span className="text-stone-400 text-xs uppercase font-bold">核心操作行为</span>
          <div className="text-2xl font-bold text-stone-800">
            {comparisonData?.behavioralPreference === 'B' ? '深度参与' : '快速完成'}
          </div>
          <span className="text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded-full">
            决策耗时: {((modeBData?.decisionTime || 0) / 1000).toFixed(1)}s
          </span>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center justify-center space-y-2">
          <span className="text-stone-400 text-xs uppercase font-bold">购买意愿评分</span>
          <div className="text-4xl font-bold text-indigo-600">
            {modeBData?.purchaseIntent ? 'High' : 'Low'}
          </div>
          <span className="text-xs text-stone-500">
            VS 直接购买: {modeAData?.purchaseIntent ? '持平' : '提升'}
          </span>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center justify-center space-y-2">
          <span className="text-stone-400 text-xs uppercase font-bold">用户标签</span>
          <div className="text-xl font-bold text-orange-600 text-center">
            {getPersonaLabel()}
          </div>
          <div className="flex gap-1">
            {[1,2,3].map(i => <Star key={i} size={12} className="text-orange-400 fill-orange-400" />)}
          </div>
        </div>
      </div>

      {/* Module 2 & 3: Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Radar Chart: Preference Profile */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
          <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Target size={18} /> 优惠偏好画像
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#78716c', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="User" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-stone-400 text-center mt-2">
            基于您的交互行为生成的五维偏好模型
          </p>
        </div>

        {/* Bar Chart: Psychological Data */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
          <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
            <BarChart3 size={18} /> 心理感受数据
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={psychData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f5f5f4" />
                <XAxis type="number" domain={[0, 10]} hide />
                <YAxis dataKey="name" type="category" width={50} tick={{ fill: '#57534e', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#fafaf9'}} />
                <Bar dataKey="user" name="您的评分" fill="#f97316" radius={[0, 4, 4, 0]} barSize={20} />
                <Bar dataKey="avg" name="全域均值" fill="#cbd5e1" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4 text-xs text-stone-500">
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-500 rounded-sm"></div>您的评分</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-300 rounded-sm"></div>Z世代均值</div>
          </div>
        </div>
      </div>

      {/* Module 4: Suggestions */}
      <div className="bg-stone-900 text-white p-8 rounded-3xl shadow-xl">
        <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
          <Lightbulb size={24} className="text-yellow-400" /> 个性化优惠建议
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {suggestions.map((s, i) => (
            <div key={i} className="bg-white/10 p-5 rounded-2xl backdrop-blur-sm border border-white/10">
              <h4 className="font-bold text-yellow-400 mb-2 text-sm uppercase tracking-wider">{s.title}</h4>
              <p className="text-sm text-stone-200 leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-6 border-t border-white/10 text-xs text-stone-400 flex justify-between items-center">
          <span>* 建议基于您的实验行为数据生成，仅供参考</span>
          <span className="font-mono">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col gap-3 print:hidden">
        <button 
          onClick={() => window.print()}
          className="w-full py-4 bg-stone-800 text-white rounded-2xl font-bold hover:bg-stone-700 transition-all flex items-center justify-center gap-2"
        >
          <Download size={20} /> 导出报告 (PDF/Image)
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => window.location.reload()}
            className="py-4 bg-white border border-stone-200 text-stone-600 rounded-2xl font-bold hover:bg-stone-50 transition-all"
          >
            重新测试
          </button>
          <button 
            className="py-4 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl font-bold hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
            onClick={() => setViewMode('dashboard')}
          >
            <Building2 size={18} /> 企业后台
          </button>
        </div>
      </div>
    </motion.div>
  );
}
