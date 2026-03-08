import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scissors, Share2, Users, Zap, MessageCircle
} from 'lucide-react';
import { Product } from '../types';

interface BargainScenarioProps {
  product: Product;
  onUpdatePrice: (price: number, metrics?: any) => void;
}

export const BargainScenario: React.FC<BargainScenarioProps> = ({ product, onUpdatePrice }) => {
  const [slashedAmount, setSlashedAmount] = useState(0);
  const [slashCount, setSlashCount] = useState(0);
  const [friendsHelped, setFriendsHelped] = useState<{name: string, amount: number}[]>([]);
  const [isSharing, setIsSharing] = useState(false);
  
  // Metrics
  const startTimeRef = useRef(Date.now());
  const metricsRef = useRef<any>({ slash_count: 0, share_count: 0 });

  const MAX_SLASH = Math.floor(product.originalPrice * 0.3); // Max 30% off
  const SELF_SLASH_LIMIT = Math.floor(MAX_SLASH * 0.4); // Can slash 40% of max by self

  useEffect(() => {
    onUpdatePrice(product.originalPrice - slashedAmount, {
      ...metricsRef.current,
      final_slashed_amount: slashedAmount,
      total_time: Date.now() - startTimeRef.current
    });
  }, [slashedAmount]);

  const handleSelfSlash = () => {
    if (slashedAmount >= SELF_SLASH_LIMIT) return;
    
    // Random slash amount between 10-50
    const amount = Math.floor(Math.random() * 40) + 10;
    const newTotal = Math.min(slashedAmount + amount, SELF_SLASH_LIMIT);
    
    setSlashedAmount(newTotal);
    setSlashCount(prev => prev + 1);
    metricsRef.current.slash_count += 1;
  };

  const handleShare = () => {
    setIsSharing(true);
    metricsRef.current.share_count += 1;
    
    // Simulate friends helping
    setTimeout(() => {
      setIsSharing(false);
      const friendName = `好友${Math.floor(Math.random() * 1000)}`;
      const amount = Math.floor(Math.random() * 30) + 20;
      
      if (slashedAmount + amount <= MAX_SLASH) {
        setSlashedAmount(prev => prev + amount);
        setFriendsHelped(prev => [...prev, { name: friendName, amount }]);
      }
    }, 1500);
  };

  const progressPercent = (slashedAmount / MAX_SLASH) * 100;

  return (
    <div className="space-y-4">
      {/* Main Slash Area */}
      <div className="bg-rose-600 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]"></div>
        
        <div className="relative z-10">
          <div className="text-rose-200 font-bold mb-1 text-sm">已砍掉金额</div>
          <div className="text-5xl font-black mb-2">¥{slashedAmount}</div>
          <div className="text-xs bg-rose-800/50 inline-block px-3 py-1 rounded-full mb-4">
            目标: 砍至 ¥{product.originalPrice - MAX_SLASH} (省 ¥{MAX_SLASH})
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-rose-900/30 h-3 rounded-full mb-6 overflow-hidden relative">
            <motion.div 
              className="bg-yellow-400 h-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
            />
            {/* Markers */}
            <div className="absolute top-0 left-[40%] h-full w-0.5 bg-white/30" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleSelfSlash}
              disabled={slashedAmount >= SELF_SLASH_LIMIT}
              className="py-3 bg-white text-rose-600 rounded-xl font-bold hover:bg-rose-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <Scissors size={18} />
              {slashedAmount >= SELF_SLASH_LIMIT ? '自砍上限' : '自砍一刀'}
            </button>
            <button
              onClick={handleShare}
              disabled={slashedAmount >= MAX_SLASH || isSharing}
              className="py-3 bg-yellow-400 text-rose-900 rounded-xl font-bold hover:bg-yellow-300 transition-all disabled:opacity-50 shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              {isSharing ? (
                <span className="animate-pulse">呼叫中...</span>
              ) : (
                <>
                  <Share2 size={18} /> 喊人帮砍
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Help List */}
      <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm">
        <h4 className="font-bold text-stone-700 text-sm mb-3 flex items-center gap-2">
          <Users size={16} /> 砍价记录
        </h4>
        
        <div className="space-y-3 max-h-40 overflow-y-auto">
          {friendsHelped.length === 0 && slashCount === 0 && (
            <div className="text-center text-xs text-stone-400 py-4">
              暂无记录，快去砍第一刀吧！
            </div>
          )}
          
          {/* Self Record */}
          {slashCount > 0 && (
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                  <Zap size={14} />
                </div>
                <span className="text-stone-600">我自己</span>
              </div>
              <span className="font-bold text-rose-600">砍掉 ¥{friendsHelped.length > 0 ? slashedAmount - friendsHelped.reduce((a, b) => a + b.amount, 0) : slashedAmount}</span>
            </div>
          )}

          {/* Friends Records */}
          <AnimatePresence>
            {friendsHelped.map((friend, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-between items-center text-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <MessageCircle size={14} />
                  </div>
                  <span className="text-stone-600">{friend.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-400">来助攻了</span>
                  <span className="font-bold text-rose-600">砍掉 ¥{friend.amount}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
