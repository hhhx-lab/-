import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coins, CheckCircle2, ArrowRight, Share2, Eye, Calendar, ShoppingBag,
  X, Search, ThumbsUp, MessageCircle, MoreHorizontal, Check, Clock
} from 'lucide-react';
import { Product } from '../types';

interface PointsScenarioProps {
  product: Product;
  onUpdatePrice: (price: number, metrics?: any) => void;
}

export const PointsScenario: React.FC<PointsScenarioProps> = ({ product, onUpdatePrice }) => {
  const [points, setPoints] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemedPoints, setRedeemedPoints] = useState(0);
  const [activeTask, setActiveTask] = useState<string | null>(null);

  // Metrics
  const startTimeRef = useRef(Date.now());
  const metricsRef = useRef<any>({ tasks_completed: [] });

  const TASKS = [
    { id: 'signin', name: '每日签到', points: 100, icon: Calendar, action: '去签到', desc: '连续签到奖励翻倍' },
    { id: 'browse', name: '浏览推荐商品', points: 200, icon: Eye, action: '去浏览', desc: '浏览满5秒可领积分' },
    { id: 'share', name: '分享给好友', points: 300, icon: Share2, action: '去分享', desc: '成功分享给1位好友' },
    { id: 'add', name: '加购凑单品', points: 150, icon: ShoppingBag, action: '去加购', desc: '加购1件超值好物' },
  ];

  const INITIAL_POINTS = 500; 

  useEffect(() => {
    setPoints(INITIAL_POINTS);
  }, []);

  useEffect(() => {
    const discountRate = (redeemedPoints / 100) * 0.01;
    const currentPrice = Math.floor(product.originalPrice * (1 - discountRate));

    onUpdatePrice(currentPrice, {
      ...metricsRef.current,
      initial_points: INITIAL_POINTS,
      earned_points: points - INITIAL_POINTS,
      redeemed_points: redeemedPoints,
      total_time: Date.now() - startTimeRef.current
    });
  }, [redeemedPoints, points]);

  const handleTaskStart = (taskId: string) => {
    if (completedTasks.includes(taskId)) return;
    setActiveTask(taskId);
  };

  const handleTaskComplete = (taskId: string, reward: number) => {
    setPoints(prev => prev + reward);
    setCompletedTasks(prev => [...prev, taskId]);
    metricsRef.current.tasks_completed.push(taskId);
    setActiveTask(null);
  };

  const handleRedeemToggle = () => {
    if (isRedeeming) {
      setRedeemedPoints(0);
    } else {
      const maxRedeemable = 3000;
      setRedeemedPoints(Math.min(points, maxRedeemable));
    }
    setIsRedeeming(!isRedeeming);
  };

  const discountAmount = Math.floor(product.originalPrice * ((redeemedPoints / 100) * 0.01));

  return (
    <div className="space-y-4 relative">
      {/* Points Header */}
      <div className="bg-purple-600 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Coins size={120} />
        </div>
        
        <div className="relative z-10">
          <div className="text-purple-200 text-sm font-bold mb-1">我的积分</div>
          <div className="text-4xl font-black flex items-baseline gap-2">
            {points}
            <span className="text-sm font-normal text-purple-200">分</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs bg-purple-800/50 w-fit px-3 py-1 rounded-full">
            <CheckCircle2 size={12} />
            <span>100积分 = 抵扣 1%</span>
          </div>
        </div>
      </div>

      {/* Redemption Control */}
      <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-bold text-stone-800">积分抵扣</h4>
          <div className="text-purple-600 font-bold">
            - ¥{discountAmount}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-stone-100 h-2 rounded-full overflow-hidden">
            <motion.div 
              className="bg-purple-500 h-full"
              initial={{ width: 0 }}
              animate={{ width: isRedeeming ? '100%' : '0%' }}
            />
          </div>
          <button
            onClick={handleRedeemToggle}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              isRedeeming 
                ? 'bg-stone-100 text-stone-500' 
                : 'bg-purple-600 text-white shadow-lg shadow-purple-200'
            }`}
          >
            {isRedeeming ? '取消' : '立即抵扣'}
          </button>
        </div>
        {isRedeeming && (
          <p className="text-xs text-stone-400 mt-2 text-center">
            已使用 {redeemedPoints} 积分，抵扣 {redeemedPoints/100}%
          </p>
        )}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        <h4 className="font-bold text-stone-700 text-sm flex items-center gap-2">
          <Coins size={16} /> 做任务赚积分
        </h4>
        <div className="space-y-2">
          {TASKS.map(task => {
            const isCompleted = completedTasks.includes(task.id);
            return (
              <div 
                key={task.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isCompleted ? 'bg-purple-50 border-purple-100' : 'bg-white border-stone-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${isCompleted ? 'bg-purple-200 text-purple-700' : 'bg-stone-100 text-stone-500'}`}>
                    <task.icon size={18} />
                  </div>
                  <div>
                    <div className="font-bold text-stone-800 text-sm">{task.name}</div>
                    <div className="text-xs text-stone-400">{task.desc}</div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleTaskStart(task.id)}
                  disabled={isCompleted}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-transparent text-purple-700 flex items-center gap-1'
                      : 'bg-stone-900 text-white hover:bg-stone-700'
                  }`}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle2 size={14} /> 已完成
                    </>
                  ) : (
                    <>
                      {task.action} <span className="text-purple-200 ml-1">+{task.points}</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Overlays */}
      <AnimatePresence>
        {activeTask && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4"
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden max-h-[80vh] flex flex-col"
            >
              {/* Overlay Header */}
              <div className="p-4 border-b flex justify-between items-center bg-stone-50">
                <h3 className="font-bold text-stone-800">
                  {TASKS.find(t => t.id === activeTask)?.name}
                </h3>
                <button 
                  onClick={() => setActiveTask(null)}
                  className="p-1 hover:bg-stone-200 rounded-full"
                >
                  <X size={20} className="text-stone-500" />
                </button>
              </div>

              {/* Overlay Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {activeTask === 'signin' && (
                  <SignInTask onComplete={() => handleTaskComplete('signin', 100)} />
                )}
                {activeTask === 'browse' && (
                  <BrowseTask onComplete={() => handleTaskComplete('browse', 200)} />
                )}
                {activeTask === 'share' && (
                  <ShareTask onComplete={() => handleTaskComplete('share', 300)} />
                )}
                {activeTask === 'add' && (
                  <AddToCartTask onComplete={() => handleTaskComplete('add', 150)} />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Sub-components for Tasks ---

const SignInTask = ({ onComplete }: { onComplete: () => void }) => {
  const [signed, setSigned] = useState(false);
  
  const handleSign = () => {
    setSigned(true);
    setTimeout(onComplete, 1500);
  };

  return (
    <div className="text-center py-8">
      <div className="grid grid-cols-7 gap-2 mb-8">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className={`flex flex-col items-center gap-1 ${i === 3 ? 'scale-110' : 'opacity-50'}`}>
            <div className="text-xs text-stone-400">Day {i + 1}</div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
              i < 3 ? 'bg-purple-100 border-purple-200 text-purple-600' : 
              i === 3 && signed ? 'bg-purple-600 border-purple-600 text-white' :
              'bg-white border-stone-200 text-stone-300'
            }`}>
              {i < 3 || (i === 3 && signed) ? <Check size={16} /> : <span className="text-xs">+{100}</span>}
            </div>
          </div>
        ))}
      </div>
      
      <button
        onClick={handleSign}
        disabled={signed}
        className={`w-full py-3 rounded-xl font-bold text-lg transition-all ${
          signed 
            ? 'bg-green-500 text-white' 
            : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200'
        }`}
      >
        {signed ? '签到成功 +100积分' : '立即签到'}
      </button>
    </div>
  );
};

const BrowseTask = ({ onComplete }: { onComplete: () => void }) => {
  const [timeLeft, setTimeLeft] = useState(5);
  const [canClaim, setCanClaim] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else {
      setCanClaim(true);
    }
  }, [timeLeft]);

  const ITEMS = [
    { title: '夏季凉感被', price: 129, img: 'https://picsum.photos/seed/bed/200/200' },
    { title: '便携榨汁机', price: 89, img: 'https://picsum.photos/seed/juice/200/200' },
    { title: '日式餐具套', price: 45, img: 'https://picsum.photos/seed/dish/200/200' },
    { title: '纯棉T恤', price: 59, img: 'https://picsum.photos/seed/shirt/200/200' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-orange-50 p-3 rounded-lg text-orange-700 text-sm">
        <div className="flex items-center gap-2">
          <Clock size={16} />
          <span>浏览 {timeLeft > 0 ? `${timeLeft}秒` : '完成'} 可领积分</span>
        </div>
        {canClaim && <span className="font-bold">任务完成</span>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {ITEMS.map((item, i) => (
          <div key={i} className="border rounded-lg overflow-hidden">
            <img src={item.img} alt={item.title} className="w-full h-32 object-cover" />
            <div className="p-2">
              <div className="font-bold text-sm truncate">{item.title}</div>
              <div className="text-red-500 font-bold text-xs">¥{item.price}</div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onComplete}
        disabled={!canClaim}
        className={`w-full py-3 rounded-xl font-bold transition-all ${
          canClaim 
            ? 'bg-purple-600 text-white shadow-lg' 
            : 'bg-stone-200 text-stone-400 cursor-not-allowed'
        }`}
      >
        {canClaim ? '领取 200 积分' : `请继续浏览 (${timeLeft}s)`}
      </button>
    </div>
  );
};

const ShareTask = ({ onComplete }: { onComplete: () => void }) => {
  const [shared, setShared] = useState(false);

  const handleShare = () => {
    setShared(true);
    setTimeout(onComplete, 1000);
  };

  const PLATFORMS = [
    { name: '微信好友', icon: MessageCircle, color: 'bg-green-500' },
    { name: '朋友圈', icon: CheckCircle2, color: 'bg-green-600' }, // Mock icons
    { name: 'QQ好友', icon: MessageCircle, color: 'bg-blue-500' },
    { name: '复制链接', icon: MoreHorizontal, color: 'bg-stone-500' },
  ];

  return (
    <div className="py-4">
      <div className="text-center mb-6 text-stone-600 text-sm">
        分享给好友，好友点击后即可获得积分
      </div>
      
      <div className="grid grid-cols-4 gap-4 mb-8">
        {PLATFORMS.map((p, i) => (
          <button key={i} onClick={handleShare} className="flex flex-col items-center gap-2">
            <div className={`w-12 h-12 rounded-full ${p.color} text-white flex items-center justify-center`}>
              <p.icon size={24} />
            </div>
            <span className="text-xs text-stone-500">{p.name}</span>
          </button>
        ))}
      </div>

      {shared && (
        <div className="text-center text-green-600 font-bold animate-bounce">
          分享成功！积分已到账
        </div>
      )}
    </div>
  );
};

const AddToCartTask = ({ onComplete }: { onComplete: () => void }) => {
  const ITEMS = [
    { id: 1, title: '抽纸 3包', price: 9.9, img: 'https://picsum.photos/seed/paper/100/100' },
    { id: 2, title: '垃圾袋 5卷', price: 12.9, img: 'https://picsum.photos/seed/trash/100/100' },
    { id: 3, title: '洗碗布 10条', price: 8.8, img: 'https://picsum.photos/seed/cloth/100/100' },
  ];

  return (
    <div className="space-y-4">
      <div className="text-sm text-stone-500 mb-2">加购任意一件商品即可完成任务</div>
      {ITEMS.map(item => (
        <div key={item.id} className="flex items-center gap-3 p-2 border rounded-xl">
          <img src={item.img} alt={item.title} className="w-16 h-16 rounded-lg object-cover" />
          <div className="flex-1">
            <div className="font-bold text-stone-800">{item.title}</div>
            <div className="text-red-500 font-bold">¥{item.price}</div>
          </div>
          <button
            onClick={onComplete}
            className="p-2 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200"
          >
            <ShoppingBag size={20} />
          </button>
        </div>
      ))}
    </div>
  );
};
