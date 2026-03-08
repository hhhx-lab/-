import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingCart, Plus, Minus, CheckCircle2, X, Info, ArrowRight, Tag
} from 'lucide-react';
import { Product } from '../types';
import { BUNDLE_ITEMS } from '../constants';

interface BundleScenarioProps {
  product: Product;
  onUpdatePrice: (price: number, metrics?: any) => void;
}

export const BundleScenario: React.FC<BundleScenarioProps> = ({ product, onUpdatePrice }) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewingItem, setViewingItem] = useState<string | null>(null); // ID of item being viewed
  const [showConfirmToast, setShowConfirmToast] = useState(false);

  // Metrics
  const startTimeRef = useRef(Date.now());
  const metricsRef = useRef<any>({ core_select_time: 0, addon_view_time: 0, bundle_count: 0 });

  // Discount Logic:
  // Core = 10% off
  // Core + 1 = 20% off total
  // Core + 2 = 30% off total
  const getBundleDiscount = (count: number) => {
    if (count >= 2) return 0.3;
    if (count >= 1) return 0.2;
    return 0.1;
  };

  const calculateTotal = () => {
    const addonsTotal = selectedItems.reduce((sum, id) => {
      const item = BUNDLE_ITEMS.find(i => i.id === id);
      return sum + (item ? item.discountedPrice : 0);
    }, 0);
    
    // Apply bundle discount to EVERYTHING (Core + Addons)
    // Or just Core? Usually bundles apply to the whole package or Core gets cheaper.
    // Let's apply to Core product specifically to show "Main Product Savings".
    // Actually, "Cross-category Bundle" usually implies total order discount.
    // Let's simplify: The displayed "Dynamic Price" in parent is usually the Main Product Price.
    // So we will discount the Main Product heavily based on bundle size.
    
    const discountRate = getBundleDiscount(selectedItems.length);
    const mainPrice = Math.floor(product.originalPrice * (1 - discountRate));
    
    return { mainPrice, addonsTotal, total: mainPrice + addonsTotal, discountRate };
  };

  useEffect(() => {
    const { mainPrice, addonsTotal, discountRate } = calculateTotal();
    // We update the parent with the Total Bundle Price? 
    // The parent displays "¥{dynamicPrice}". If we send total, it might look expensive.
    // But it's a bundle. Let's send the Main Product Price (discounted) and let the user see the addons cost below.
    // Wait, if I send Main Price, the user thinks they pay that. But they have to pay for addons too.
    // Let's send the TOTAL price to the parent, but we need to make sure the parent UI understands it's a bundle.
    // The parent UI just shows "¥{dynamicPrice}". 
    // If I select a $50 addon, and price jumps up, user might be confused if they think it's just the main product.
    // Strategy: Update parent with TOTAL price. The UI in parent shows "¥{dynamicPrice}".
    // We will add a visual in THIS component showing the breakdown.
    
    onUpdatePrice(mainPrice + addonsTotal, {
      ...metricsRef.current,
      bundle_count: selectedItems.length,
      total_time: Date.now() - startTimeRef.current,
      total_savings: Math.floor(product.originalPrice * discountRate)
    });
  }, [selectedItems]);

  const handleViewDetails = (id: string) => {
    setViewingItem(id);
    metricsRef.current.addon_view_start = Date.now();
  };

  const handleCloseDetails = (addToBundle: boolean) => {
    if (metricsRef.current.addon_view_start) {
      metricsRef.current.addon_view_time += (Date.now() - metricsRef.current.addon_view_start);
    }
    
    if (addToBundle && viewingItem) {
      if (!selectedItems.includes(viewingItem)) {
        setSelectedItems(prev => [...prev, viewingItem]);
        setShowConfirmToast(true);
        setTimeout(() => setShowConfirmToast(false), 2000);
      }
    }
    setViewingItem(null);
  };

  const handleRemove = (id: string) => {
    setSelectedItems(prev => prev.filter(i => i !== id));
  };

  const { mainPrice, addonsTotal, discountRate } = calculateTotal();
  const currentItem = BUNDLE_ITEMS.find(i => i.id === viewingItem);

  return (
    <div className="space-y-4">
      {/* Bundle Status Header */}
      <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="font-bold text-blue-900 text-lg">跨品类攒单</h4>
            <p className="text-xs text-blue-600">
              已选 {selectedItems.length} 件搭配，主商品享 <span className="font-bold text-lg">{Math.round((1-discountRate)*10)}折</span>
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-stone-400 line-through">单独买 ¥{product.originalPrice + addonsTotal}</div>
            <div className="text-xl font-black text-blue-600">¥{mainPrice + addonsTotal}</div>
            <div className="text-xs text-green-600 font-bold bg-green-100 px-1 rounded">
              省 ¥{product.originalPrice - mainPrice}
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-1 text-xs font-bold text-stone-400 mb-2">
          <div className={`flex-1 py-1 text-center rounded ${selectedItems.length >= 0 ? 'bg-blue-200 text-blue-700' : 'bg-stone-100'}`}>主商品 (9折)</div>
          <ArrowRight size={12} />
          <div className={`flex-1 py-1 text-center rounded ${selectedItems.length >= 1 ? 'bg-blue-200 text-blue-700' : 'bg-stone-100'}`}>+1件 (8折)</div>
          <ArrowRight size={12} />
          <div className={`flex-1 py-1 text-center rounded ${selectedItems.length >= 2 ? 'bg-blue-200 text-blue-700' : 'bg-stone-100'}`}>+2件 (7折)</div>
        </div>
      </div>

      {/* Add-on List */}
      <div className="space-y-3">
        <h4 className="font-bold text-stone-700 text-sm flex items-center gap-2">
          <Tag size={16} /> 热门搭配推荐
        </h4>
        <div className="grid grid-cols-1 gap-3">
          {BUNDLE_ITEMS.map(item => {
            const isSelected = selectedItems.includes(item.id);
            return (
              <div 
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white border-stone-100'}`}
              >
                <img src={item.image} className="w-16 h-16 rounded-lg object-cover bg-stone-200" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-stone-800 truncate">{item.name}</div>
                  <div className="text-xs text-stone-500 line-clamp-1">{item.description}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-stone-900">¥{item.discountedPrice}</span>
                    <span className="text-xs text-stone-400 line-through">¥{item.originalPrice}</span>
                  </div>
                </div>
                
                {isSelected ? (
                  <button 
                    onClick={() => handleRemove(item.id)}
                    className="p-2 bg-stone-100 text-stone-500 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <Minus size={18} />
                  </button>
                ) : (
                  <button 
                    onClick={() => handleViewDetails(item.id)}
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-full hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                  >
                    去凑单
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Item Detail Modal */}
      <AnimatePresence>
        {viewingItem && currentItem && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center sm:p-4"
          >
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="relative h-48 bg-stone-100">
                <img src={currentItem.image} className="w-full h-full object-cover" />
                <button 
                  onClick={() => handleCloseDetails(false)}
                  className="absolute top-4 right-4 p-2 bg-black/20 text-white rounded-full backdrop-blur-md"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <h3 className="text-xl font-bold text-stone-900">{currentItem.name}</h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-blue-600">¥{currentItem.discountedPrice}</span>
                    <span className="text-sm text-stone-400 line-through">¥{currentItem.originalPrice}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-stone-700">商品详情</h4>
                  <p className="text-sm text-stone-500 leading-relaxed">
                    {currentItem.description}。此商品为本次活动精选搭配，组合购买可享受主商品额外折扣。品质保证，七天无理由退换。
                  </p>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => handleCloseDetails(true)}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    加入攒单
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Toast */}
      <AnimatePresence>
        {showConfirmToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-stone-900 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-xl z-50"
          >
            <CheckCircle2 size={16} className="text-green-400" />
            已加入攒单，优惠升级！
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
