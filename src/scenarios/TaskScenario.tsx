import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Search, Share2, CheckCircle2, ArrowRight, X, Clock, Loader2, FileText 
} from 'lucide-react';
import { Product } from '../types';

interface TaskScenarioProps {
  product: Product;
  onUpdatePrice: (price: number, metrics?: any) => void;
}

export const TaskScenario: React.FC<TaskScenarioProps> = ({ product, onUpdatePrice }) => {
  const [step, setStep] = useState(0); // 0: Start, 1: Collect, 2: Browse, 3: Share/Survey, 4: Done
  const [showBrowseModal, setShowBrowseModal] = useState(false);
  const [browseCount, setBrowseCount] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  // Metrics tracking
  const startTimeRef = useRef(Date.now());
  const stepStartRef = useRef(Date.now());
  const metricsRef = useRef<any>({});

  const discounts = [0, 0.1, 0.2, 0.3]; // 0%, 10%, 20%, 30%

  useEffect(() => {
    const discountAmount = Math.floor(product.originalPrice * discounts[Math.min(step, 3)]);
    const currentPrice = product.originalPrice - discountAmount;
    
    // Update parent with current price and metrics
    onUpdatePrice(currentPrice, {
      ...metricsRef.current,
      current_step: step,
      total_time: Date.now() - startTimeRef.current
    });
  }, [step]);

  const handleCollect = () => {
    const time = Date.now() - stepStartRef.current;
    metricsRef.current.step1_collect_time = time;
    setStep(1);
    stepStartRef.current = Date.now();
  };

  const handleBrowseComplete = () => {
    const time = Date.now() - stepStartRef.current;
    metricsRef.current.step2_browse_time = time;
    metricsRef.current.step2_browse_count = 3;
    setStep(2);
    setShowBrowseModal(false);
    stepStartRef.current = Date.now();
  };

  const handleShare = () => {
    setIsSharing(true);
    setTimeout(() => {
      setIsSharing(false);
      setShowShareModal(false);
      setShowSurveyModal(true);
      metricsRef.current.step3_share_time = Date.now() - stepStartRef.current;
      stepStartRef.current = Date.now(); // Reset for survey
    }, 1500); // Simulate share delay
  };

  const handleSurveyComplete = () => {
    metricsRef.current.step3_survey_time = Date.now() - stepStartRef.current;
    setStep(3);
    setShowSurveyModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-bold text-orange-800 text-sm">任务进度: {step}/3</h4>
          <span className="text-xs text-orange-600 font-mono">已省 ¥{Math.floor(product.originalPrice * discounts[Math.min(step, 3)])}</span>
        </div>
        <div className="w-full bg-orange-200 h-2 rounded-full mb-4 overflow-hidden">
          <motion.div 
            className="bg-orange-500 h-full"
            initial={{ width: 0 }}
            animate={{ width: `${(Math.min(step, 3) / 3) * 100}%` }}
          />
        </div>

        <div className="space-y-3">
          {/* Task 1: Collect */}
          <TaskItem 
            icon={<Heart size={16} />}
            title="收藏商品"
            desc="基础优惠 9折"
            isCompleted={step >= 1}
            isActive={step === 0}
            onClick={handleCollect}
            btnText="去收藏"
          />

          {/* Task 2: Browse */}
          <TaskItem 
            icon={<Search size={16} />}
            title="浏览同类商品"
            desc="进阶优惠 8折 (需浏览3款)"
            isCompleted={step >= 2}
            isActive={step === 1}
            onClick={() => setShowBrowseModal(true)}
            btnText="去浏览"
          />

          {/* Task 3: Share & Survey */}
          <TaskItem 
            icon={<Share2 size={16} />}
            title="分享并填写问卷"
            desc="终极优惠 7折"
            isCompleted={step >= 3}
            isActive={step === 2}
            onClick={() => setShowShareModal(true)}
            btnText="去完成"
          />
        </div>
      </div>

      {/* Browse Modal */}
      <AnimatePresence>
        {showBrowseModal && (
          <BrowseModal 
            onClose={() => setShowBrowseModal(false)} 
            onComplete={handleBrowseComplete}
          />
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <ShareModal 
            onClose={() => setShowShareModal(false)}
            onShare={handleShare}
            isSharing={isSharing}
          />
        )}
      </AnimatePresence>

      {/* Survey Modal */}
      <AnimatePresence>
        {showSurveyModal && (
          <SurveyModal 
            onClose={() => setShowSurveyModal(false)}
            onComplete={handleSurveyComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const TaskItem = ({ icon, title, desc, isCompleted, isActive, onClick, btnText }: any) => (
  <button
    disabled={!isActive}
    onClick={onClick}
    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
      isCompleted 
        ? 'bg-green-50 border-green-200 text-green-700' 
        : isActive 
          ? 'bg-white border-orange-400 text-orange-800 shadow-sm scale-[1.02]' 
          : 'bg-stone-50 border-stone-100 text-stone-400 opacity-60'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-full ${isCompleted ? 'bg-green-200' : 'bg-stone-200'}`}>
        {isCompleted ? <CheckCircle2 size={14} /> : icon}
      </div>
      <div>
        <div className="font-bold text-sm">{title}</div>
        <div className="text-xs opacity-80">{desc}</div>
      </div>
    </div>
    {isActive && (
      <div className="px-3 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-full animate-pulse flex items-center gap-1">
        {btnText} <ArrowRight size={10} />
      </div>
    )}
  </button>
);

const BrowseModal = ({ onClose, onComplete }: any) => {
  const [viewed, setViewed] = useState<number[]>([]);
  const [timer, setTimer] = useState(0);
  const [activeItem, setActiveItem] = useState<number | null>(null);

  useEffect(() => {
    let interval: any;
    if (activeItem !== null) {
      interval = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeItem]);

  useEffect(() => {
    if (timer >= 3 && activeItem !== null) { // 3 seconds per item for demo speed
      if (!viewed.includes(activeItem)) {
        setViewed(prev => [...prev, activeItem]);
      }
      setActiveItem(null);
      setTimer(0);
    }
  }, [timer, activeItem]);

  useEffect(() => {
    if (viewed.length >= 3) {
      setTimeout(onComplete, 500);
    }
  }, [viewed]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
    >
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b flex justify-between items-center bg-stone-50">
          <h3 className="font-bold">浏览同类商品 ({viewed.length}/3)</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        
        {activeItem === null ? (
          <div className="p-4 grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div 
                key={i} 
                onClick={() => setActiveItem(i)}
                className={`relative aspect-square bg-stone-100 rounded-xl overflow-hidden cursor-pointer border-2 ${viewed.includes(i) ? 'border-green-500 opacity-50' : 'border-transparent hover:border-orange-300'}`}
              >
                <img src={`https://picsum.photos/seed/item${i}/200/200`} className="w-full h-full object-cover" />
                {viewed.includes(i) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-green-500/20">
                    <CheckCircle2 className="text-green-600 bg-white rounded-full" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
              <Clock size={32} className="animate-spin" />
            </div>
            <h3 className="font-bold text-lg">浏览中...</h3>
            <p className="text-stone-500">请停留 3 秒 ({timer}s)</p>
            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
              <motion.div 
                className="bg-orange-500 h-full"
                animate={{ width: `${(timer / 3) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const ShareModal = ({ onClose, onShare, isSharing }: any) => (
  <motion.div 
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center sm:p-4"
  >
    <motion.div 
      initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
      className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
    >
      <div className="p-6 space-y-6">
        <h3 className="font-bold text-center text-lg">分享给好友</h3>
        <div className="grid grid-cols-4 gap-4">
          {['微信', '朋友圈', 'QQ', '微博'].map((platform, i) => (
            <button 
              key={i}
              onClick={onShare}
              disabled={isSharing}
              className="flex flex-col items-center gap-2"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${['bg-green-500', 'bg-green-600', 'bg-blue-500', 'bg-red-500'][i]}`}>
                {isSharing ? <Loader2 size={20} className="animate-spin" /> : <Share2 size={20} />}
              </div>
              <span className="text-xs text-stone-600">{platform}</span>
            </button>
          ))}
        </div>
        <button onClick={onClose} className="w-full py-3 bg-stone-100 rounded-xl font-bold text-stone-600">取消</button>
      </div>
    </motion.div>
  </motion.div>
);

const SurveyModal = ({ onClose, onComplete }: any) => {
  const [answers, setAnswers] = useState<any>({});
  
  const canSubmit = Object.keys(answers).length >= 2; // 2 questions

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
    >
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-6 space-y-6">
        <div className="flex items-center gap-2 text-orange-600 font-bold">
          <FileText size={20} />
          <h3>消费小调查</h3>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-700">1. 您通常网购频率是？</label>
            <div className="grid grid-cols-2 gap-2">
              {['每天', '每周2-3次', '每月几次', '很少'].map(opt => (
                <button 
                  key={opt}
                  onClick={() => setAnswers({...answers, q1: opt})}
                  className={`py-2 text-xs rounded-lg border ${answers.q1 === opt ? 'bg-orange-50 border-orange-500 text-orange-700' : 'border-stone-200'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-700">2. 您更看重商品哪方面？</label>
            <div className="grid grid-cols-2 gap-2">
              {['价格', '品质', '品牌', '服务'].map(opt => (
                <button 
                  key={opt}
                  onClick={() => setAnswers({...answers, q2: opt})}
                  className={`py-2 text-xs rounded-lg border ${answers.q2 === opt ? 'bg-orange-50 border-orange-500 text-orange-700' : 'border-stone-200'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          disabled={!canSubmit}
          onClick={onComplete}
          className="w-full py-3 bg-orange-600 text-white rounded-xl font-bold disabled:opacity-50"
        >
          提交并领取优惠
        </button>
      </div>
    </motion.div>
  );
};
