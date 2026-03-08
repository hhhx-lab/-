import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gift, Search, Clock, CheckCircle2, AlertCircle, X, ChevronDown, ChevronUp
} from 'lucide-react';
import { Product } from '../types';

interface TreasureScenarioProps {
  product: Product;
  onUpdatePrice: (price: number, metrics?: any) => void;
}

export const TreasureScenario: React.FC<TreasureScenarioProps> = ({ product, onUpdatePrice }) => {
  const [gameState, setGameState] = useState<'INTRO' | 'PLAYING' | 'FINISHED'>('INTRO');
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [foundEggs, setFoundEggs] = useState<number[]>([]); // IDs of found eggs
  const [showDetails, setShowDetails] = useState(false); // For Egg 1 (hidden in details)
  const [toast, setToast] = useState<string | null>(null);

  // Metrics
  const startTimeRef = useRef(0);
  const metricsRef = useRef<any>({ click_count: 0 });

  const eggs = [
    { id: 1, hint: '商品详情里藏着惊喜...', type: 'detail' },
    { id: 2, hint: '往下滑动看看...', type: 'scroll' },
    { id: 3, hint: '屏幕角落有东西...', type: 'float' },
  ];

  const discountPerEgg = Math.floor(product.originalPrice * 0.1); // 10% per egg

  useEffect(() => {
    const currentPrice = product.originalPrice - (foundEggs.length * discountPerEgg);
    onUpdatePrice(currentPrice, {
      ...metricsRef.current,
      total_eggs: foundEggs.length,
      total_time: Date.now() - startTimeRef.current
    });
  }, [foundEggs]);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('FINISHED');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  const startGame = () => {
    setGameState('PLAYING');
    startTimeRef.current = Date.now();
  };

  const handleEggClick = (id: number) => {
    if (foundEggs.includes(id)) return;
    
    const now = Date.now();
    metricsRef.current[`egg${id}_time`] = now - startTimeRef.current;
    metricsRef.current.click_count += 1;

    setFoundEggs(prev => {
      const newFound = [...prev, id];
      if (newFound.length === eggs.length) {
        setTimeout(() => setGameState('FINISHED'), 1000);
      }
      return newFound;
    });

    setToast(`找到彩蛋！优惠 ¥${discountPerEgg}`);
    setTimeout(() => setToast(null), 2000);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-4 relative min-h-[300px]">
      {/* Game Header / Status */}
      <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 sticky top-0 z-10">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full ${gameState === 'PLAYING' ? 'bg-yellow-500 text-white animate-pulse' : 'bg-yellow-200 text-yellow-700'}`}>
              <Clock size={16} />
            </div>
            <span className={`font-bold font-mono text-lg ${timeLeft < 30 ? 'text-red-500' : 'text-yellow-800'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <div className="text-right">
            <div className="text-xs text-yellow-600 font-bold uppercase">已找彩蛋</div>
            <div className="flex gap-1 mt-1">
              {eggs.map(egg => (
                <div key={egg.id} className={`w-3 h-3 rounded-full transition-all ${foundEggs.includes(egg.id) ? 'bg-yellow-500 scale-110' : 'bg-yellow-200'}`} />
              ))}
            </div>
          </div>
        </div>
        
        {gameState === 'INTRO' && (
          <div className="text-center py-4">
            <h3 className="font-bold text-yellow-900 mb-2">限时寻宝挑战</h3>
            <p className="text-xs text-yellow-700 mb-4">2分钟内找到3个隐藏彩蛋，解锁30%叠加优惠！</p>
            <button 
              onClick={startGame}
              className="w-full py-3 bg-yellow-500 text-white rounded-xl font-bold hover:bg-yellow-600 shadow-lg shadow-yellow-200 active:scale-95 transition-all"
            >
              开始寻宝
            </button>
          </div>
        )}

        {gameState === 'FINISHED' && (
          <div className="text-center py-2">
            <h3 className="font-bold text-green-700 flex items-center justify-center gap-2">
              <CheckCircle2 size={18} /> 挑战结束
            </h3>
            <p className="text-xs text-green-600">
              共找到 {foundEggs.length} 个彩蛋，累计省 ¥{foundEggs.length * discountPerEgg}
            </p>
          </div>
        )}
      </div>

      {/* Game Area - Simulated Content for Hiding Eggs */}
      {gameState === 'PLAYING' && (
        <div className="space-y-6 py-4 relative">
          {/* Hint Text */}
          <div className="text-center text-xs text-stone-400 animate-pulse">
            彩蛋藏在页面各处，试试点击、滑动...
          </div>

          {/* Egg 1: Hidden in Details (Expandable) */}
          <div className="bg-white p-4 rounded-xl border border-stone-100 shadow-sm">
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex justify-between items-center text-sm font-bold text-stone-700"
            >
              <span>商品详情参数</span>
              {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <AnimatePresence>
              {showDetails && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 text-xs text-stone-500 space-y-2 relative">
                    <p>材质：环保ABS</p>
                    <p>尺寸：150mm x 80mm</p>
                    <p>重量：200g</p>
                    {/* The Egg */}
                    {!foundEggs.includes(1) && (
                      <motion.button
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEggClick(1)}
                        className="absolute right-0 top-4 text-yellow-500 p-2 hover:bg-yellow-50 rounded-full"
                      >
                        <Gift size={24} />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Egg 2: Scroll Area (Simulated list) */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-stone-400">相关推荐</h4>
            <div className="h-32 overflow-y-auto bg-stone-50 rounded-xl p-2 border border-stone-100 relative">
              <div className="space-y-2 pb-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 bg-white rounded-lg shadow-sm" />
                ))}
                {/* The Egg at bottom */}
                {!foundEggs.includes(2) && (
                  <motion.button
                    initial={{ opacity: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1.1 }}
                    onClick={() => handleEggClick(2)}
                    className="w-full py-2 flex justify-center text-yellow-500"
                  >
                    <Gift size={24} />
                  </motion.button>
                )}
              </div>
            </div>
          </div>

          {/* Egg 3: Floating (Absolute position) */}
          {!foundEggs.includes(3) && (
            <motion.button
              initial={{ x: 0, y: 0 }}
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              onClick={() => handleEggClick(3)}
              className="absolute -right-2 top-1/2 bg-white shadow-lg border border-yellow-200 p-2 rounded-full text-yellow-500 z-20"
            >
              <Gift size={20} />
            </motion.button>
          )}
        </div>
      )}

      {/* Toast Feedback */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-stone-900 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-xl z-50"
          >
            <Gift size={16} className="text-yellow-400" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
