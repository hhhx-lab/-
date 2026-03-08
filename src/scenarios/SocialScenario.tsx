import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Share2, Clock, CheckCircle2, AlertCircle, Loader2, UserPlus
} from 'lucide-react';
import { Product } from '../types';

interface SocialScenarioProps {
  product: Product;
  onUpdatePrice: (price: number, metrics?: any) => void;
}

export const SocialScenario: React.FC<SocialScenarioProps> = ({ product, onUpdatePrice }) => {
  const [teamSize, setTeamSize] = useState(1); // 1 = just me
  const [isTeamCreated, setIsTeamCreated] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes for team building
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFailed, setIsFailed] = useState(false);

  // Metrics
  const startTimeRef = useRef(Date.now());
  const inviteCountRef = useRef(0);
  
  const maxTeam = 5;
  const targetTeam = 2; // Minimum for basic discount

  // Price logic: 
  // 1 person = 100% (Original)
  // 2 people = 90%
  // 3 people = 80%
  // 5 people = 70% (Ultimate)
  const getDiscount = (size: number) => {
    if (size >= 5) return 0.3;
    if (size >= 3) return 0.2;
    if (size >= 2) return 0.1;
    return 0;
  };

  useEffect(() => {
    const discount = getDiscount(teamSize);
    const currentPrice = Math.floor(product.originalPrice * (1 - discount));
    
    onUpdatePrice(currentPrice, {
      team_size: teamSize,
      invite_count: inviteCountRef.current,
      is_success: isSuccess,
      total_time: Date.now() - startTimeRef.current
    });
  }, [teamSize, isSuccess]);

  // Timer for team building
  useEffect(() => {
    if (!isTeamCreated || isSuccess || isFailed) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsFailed(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTeamCreated, isSuccess, isFailed]);

  // Simulate random joiners if team is created but not full
  useEffect(() => {
    if (!isTeamCreated || teamSize >= maxTeam || isSuccess || isFailed) return;

    // Random join every 10-20 seconds
    const randomDelay = Math.random() * 10000 + 10000; 
    const joiner = setTimeout(() => {
      setTeamSize(prev => Math.min(prev + 1, maxTeam));
    }, randomDelay);

    return () => clearTimeout(joiner);
  }, [teamSize, isTeamCreated, isSuccess, isFailed]);

  // Check success condition
  useEffect(() => {
    if (teamSize >= targetTeam && !isSuccess) {
      // Don't set success immediately, let them try to get to 5
      // But technically they have "succeeded" in getting a discount
    }
  }, [teamSize]);

  const handleCreateTeam = () => {
    setIsTeamCreated(true);
    startTimeRef.current = Date.now();
  };

  const handleInvite = () => {
    setIsSharing(true);
    setTimeout(() => {
      setIsSharing(false);
      setShowInviteModal(false);
      inviteCountRef.current += 1;
      // Bonus: Invite guarantees a joiner soon
      setTimeout(() => {
        setTeamSize(prev => Math.min(prev + 1, maxTeam));
      }, 2000);
    }, 1500);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-4">
      {!isTeamCreated ? (
        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 text-center space-y-4">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto text-indigo-600">
            <Users size={32} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-indigo-900">发起组队更优惠</h3>
            <p className="text-sm text-indigo-600 mt-1">
              2人成团享9折，5人满团享7折+赠品
            </p>
          </div>
          <button
            onClick={handleCreateTeam}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            一键发起组队
          </button>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-2xl border-2 border-indigo-100 shadow-sm space-y-4">
          {/* Header */}
          <div className="flex justify-between items-center pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="font-bold text-stone-800">组队进行中</span>
            </div>
            <div className={`text-xs font-mono font-bold px-2 py-1 rounded ${timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-stone-100 text-stone-600'}`}>
              剩余 {formatTime(timeLeft)}
            </div>
          </div>

          {/* Avatars */}
          <div className="flex justify-center gap-3 py-2">
            {Array.from({ length: maxTeam }).map((_, i) => (
              <div key={i} className="relative">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                  i < teamSize 
                    ? 'bg-indigo-100 border-indigo-500 text-indigo-600' 
                    : 'bg-stone-50 border-stone-200 text-stone-300 border-dashed'
                }`}>
                  {i < teamSize ? (
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} className="w-full h-full rounded-full" />
                  ) : (
                    <UserPlus size={20} />
                  )}
                </div>
                {i === 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-[10px] font-bold px-1.5 rounded-full border border-white">团长</span>
                )}
              </div>
            ))}
          </div>

          {/* Progress Info */}
          <div className="text-center space-y-1">
            <div className="text-2xl font-black text-indigo-600">
              已省 ¥{Math.floor(product.originalPrice * getDiscount(teamSize))}
            </div>
            <p className="text-xs text-stone-500">
              当前 {teamSize} 人，已解锁 {Math.floor(getDiscount(teamSize) * 100)}% 优惠
              {teamSize < maxTeam && `，再邀 ${maxTeam - teamSize} 人解锁更高优惠`}
            </p>
          </div>

          {/* Action */}
          <button
            onClick={() => setShowInviteModal(true)}
            disabled={teamSize >= maxTeam || isFailed}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Share2 size={18} />
            {teamSize >= maxTeam ? '人员已满' : '邀请好友助力'}
          </button>

          {/* Success/Fail State */}
          {isFailed && (
            <div className="bg-red-50 p-3 rounded-xl flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle size={16} />
              组队超时，已回落至当前人数优惠
            </div>
          )}
          {teamSize >= maxTeam && (
            <div className="bg-green-50 p-3 rounded-xl flex items-center gap-2 text-green-700 text-sm">
              <CheckCircle2 size={16} />
              组队满员！已解锁最高优惠+赠品
            </div>
          )}
        </div>
      )}

      {/* Invite Modal (Reuse similar style) */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center sm:p-4"
          >
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl p-6 space-y-6"
            >
              <h3 className="font-bold text-center text-lg">邀请好友加入</h3>
              <div className="grid grid-cols-3 gap-4">
                {['微信好友', '朋友圈', '复制链接'].map((platform, i) => (
                  <button 
                    key={i}
                    onClick={handleInvite}
                    disabled={isSharing}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white ${['bg-green-500', 'bg-green-600', 'bg-blue-500'][i]}`}>
                      {isSharing ? <Loader2 size={24} className="animate-spin" /> : <Share2 size={24} />}
                    </div>
                    <span className="text-xs text-stone-600">{platform}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setShowInviteModal(false)} className="w-full py-3 bg-stone-100 rounded-xl font-bold text-stone-600">取消</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
