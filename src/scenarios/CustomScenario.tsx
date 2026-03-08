import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, CheckCircle2, Circle, Ticket, Users, Share2, Zap
} from 'lucide-react';
import { Product } from '../types';

interface CustomScenarioProps {
  product: Product;
  onUpdatePrice: (price: number, metrics?: any) => void;
}

export const CustomScenario: React.FC<CustomScenarioProps> = ({ product, onUpdatePrice }) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  
  // Metrics
  const startTimeRef = useRef(Date.now());
  const metricsRef = useRef<any>({ toggle_count: 0 });

  const OPTIONS = [
    { 
      id: 'coupon', 
      name: '店铺优惠券', 
      desc: '领取店铺满减券，立享9折', 
      discount: 0.10,
      icon: Ticket,
      color: 'bg-orange-50 text-orange-600 border-orange-200'
    },
    { 
      id: 'group', 
      name: '拼单立减', 
      desc: '参与2人拼单，立享85折', 
      discount: 0.15,
      icon: Users,
      color: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    { 
      id: 'share', 
      name: '分享助力', 
      desc: '分享到群聊，立享95折', 
      discount: 0.05,
      icon: Share2,
      color: 'bg-green-50 text-green-600 border-green-200'
    },
    { 
      id: 'rush', 
      name: '限时抢购', 
      desc: '整点秒杀资格，立享8折', 
      discount: 0.20,
      icon: Zap,
      color: 'bg-red-50 text-red-600 border-red-200'
    },
  ];

  // Logic:
  // User can select up to 2 options.
  // Discounts stack multiplicatively or additively? 
  // Let's say additively for simplicity in mental math for user, but capped at some realistic number.
  // Actually, "Custom Scenario" implies finding the best combo.
  // Let's limit to 2 choices.

  useEffect(() => {
    const totalDiscountRate = selectedOptions.reduce((sum, id) => {
      const opt = OPTIONS.find(o => o.id === id);
      return sum + (opt ? opt.discount : 0);
    }, 0);

    // Cap at 35%
    const finalRate = Math.min(totalDiscountRate, 0.35);
    const currentPrice = Math.floor(product.originalPrice * (1 - finalRate));

    onUpdatePrice(currentPrice, {
      ...metricsRef.current,
      selected_options: selectedOptions,
      final_discount_rate: finalRate,
      total_time: Date.now() - startTimeRef.current
    });
  }, [selectedOptions]);

  const toggleOption = (id: string) => {
    metricsRef.current.toggle_count += 1;
    
    if (selectedOptions.includes(id)) {
      setSelectedOptions(prev => prev.filter(o => o !== id));
    } else {
      if (selectedOptions.length < 2) {
        setSelectedOptions(prev => [...prev, id]);
      } else {
        // Replace the first one (FIFO) or just block? 
        // Better UX: Shake or Toast "Max 2". 
        // Or just replace the oldest one? Let's just block and shake.
        // For simplicity here, we'll just do nothing (or maybe replace last one?)
        // Let's replace the first selected one to keep flow moving.
        setSelectedOptions(prev => [prev[1], id]);
      }
    }
  };

  const totalDiscount = selectedOptions.reduce((sum, id) => {
    const opt = OPTIONS.find(o => o.id === id);
    return sum + (opt ? opt.discount : 0);
  }, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-teal-50 p-4 rounded-2xl border border-teal-100">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-bold text-teal-900 text-lg">定制你的专属优惠</h4>
            <p className="text-xs text-teal-700">
              任选 2 项叠加，最高可省 35%
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-teal-600 font-bold uppercase">当前折扣</div>
            <div className="text-2xl font-black text-teal-600">
              -{Math.round(Math.min(totalDiscount, 0.35) * 100)}%
            </div>
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex gap-1 justify-center mt-2">
          {[0, 1].map(i => (
            <div 
              key={i} 
              className={`w-2 h-2 rounded-full transition-all ${
                i < selectedOptions.length ? 'bg-teal-500 scale-125' : 'bg-teal-200'
              }`} 
            />
          ))}
        </div>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 gap-3">
        {OPTIONS.map(opt => {
          const isSelected = selectedOptions.includes(opt.id);
          return (
            <motion.button
              key={opt.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleOption(opt.id)}
              className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                isSelected 
                  ? 'bg-white border-teal-500 shadow-md' 
                  : 'bg-white border-stone-100 hover:border-teal-200'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${opt.color}`}>
                    <opt.icon size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-stone-800">{opt.name}</div>
                    <div className="text-xs text-stone-500">{opt.desc}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-lg text-stone-900">-{opt.discount * 100}%</div>
                  <div className={`mt-1 ${isSelected ? 'text-teal-500' : 'text-stone-300'}`}>
                    {isSelected ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
      
      {selectedOptions.length === 0 && (
        <div className="text-center text-xs text-stone-400 animate-pulse">
          请选择 2 项优惠方案
        </div>
      )}
    </div>
  );
};
