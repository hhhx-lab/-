import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, CheckCircle2, Clock, Zap
} from 'lucide-react';
import { Product } from '../types';

interface CheckinScenarioProps {
  product: Product;
  onUpdatePrice: (price: number, metrics?: any) => void;
}

export const CheckinScenario: React.FC<CheckinScenarioProps> = ({ product, onUpdatePrice }) => {
  const [checkedDays, setCheckedDays] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Metrics
  const startTimeRef = useRef(Date.now());
  const metricsRef = useRef<any>({ days_checked: 0, fast_forward_used: false });

  const MAX_DAYS = 7;
  const DISCOUNT_PER_DAY = 0.05; // 5% per day, max 35%

  useEffect(() => {
    const discountRate = Math.min(checkedDays * DISCOUNT_PER_DAY, 0.35);
    const currentPrice = Math.floor(product.originalPrice * (1 - discountRate));

    onUpdatePrice(currentPrice, {
      ...metricsRef.current,
      days_checked: checkedDays,
      total_time: Date.now() - startTimeRef.current
    });
  }, [checkedDays]);

  const handleCheckIn = () => {
    if (checkedDays >= MAX_DAYS) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      setCheckedDays(prev => prev + 1);
      setIsAnimating(false);
    }, 600);
  };

  const handleFastForward = () => {
    metricsRef.current.fast_forward_used = true;
    let current = checkedDays;
    
    const interval = setInterval(() => {
      if (current >= MAX_DAYS) {
        clearInterval(interval);
        return;
      }
      current++;
      setCheckedDays(current);
    }, 200);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-sky-50 p-4 rounded-2xl border border-sky-100">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h4 className="font-bold text-sky-900 text-lg flex items-center gap-2">
              <Calendar size={20} /> 每日打卡
            </h4>
            <p className="text-xs text-sky-700">
              已连续打卡 <span className="font-bold text-lg">{checkedDays}</span> 天，当前折扣 <span className="font-bold text-lg">{(1 - Math.min(checkedDays * DISCOUNT_PER_DAY, 0.35)).toFixed(2).slice(2,4)}折</span>
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-sky-600 font-bold uppercase">明日再省</div>
            <div className="text-xl font-black text-sky-600">
              ¥{Math.floor(product.originalPrice * DISCOUNT_PER_DAY)}
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {Array.from({ length: MAX_DAYS }).map((_, i) => {
            const isChecked = i < checkedDays;
            const isToday = i === checkedDays;
            
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="text-[10px] text-sky-400 font-bold">Day {i + 1}</div>
                <motion.div 
                  initial={false}
                  animate={{ 
                    scale: isChecked ? [1, 1.2, 1] : 1,
                    backgroundColor: isChecked ? '#0ea5e9' : '#f0f9ff'
                  }}
                  className={`w-full aspect-square rounded-xl flex items-center justify-center border-2 transition-colors ${
                    isChecked 
                      ? 'border-sky-500 text-white shadow-md' 
                      : isToday 
                        ? 'border-sky-300 text-sky-300 animate-pulse' 
                        : 'border-sky-100 text-sky-200'
                  }`}
                >
                  {isChecked ? <CheckCircle2 size={16} /> : <div className="text-xs font-bold">-{Math.round(DISCOUNT_PER_DAY*100)}%</div>}
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleCheckIn}
            disabled={checkedDays >= MAX_DAYS || isAnimating}
            className="w-full py-3 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-600 transition-all shadow-lg shadow-sky-200 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
          >
            {isAnimating ? (
              <span className="animate-spin"><Clock size={18} /></span>
            ) : checkedDays >= MAX_DAYS ? (
              <>
                <CheckCircle2 size={18} /> 打卡挑战完成
              </>
            ) : (
              '今日打卡'
            )}
          </button>
          
          {checkedDays < MAX_DAYS && (
            <button
              onClick={handleFastForward}
              className="w-full py-2 bg-white text-sky-500 border border-sky-200 rounded-xl font-bold text-sm hover:bg-sky-50 transition-all flex items-center justify-center gap-2"
            >
              <Zap size={14} /> 模拟连续打卡 (体验加速)
            </button>
          )}
        </div>
      </div>
      
      <div className="text-center text-xs text-stone-400">
        坚持打卡7天，累计可省 ¥{Math.floor(product.originalPrice * 0.35)}
      </div>
    </div>
  );
};
