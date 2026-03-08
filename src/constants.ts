import { Product, ScenarioType } from './types';

export const SCENARIOS: Record<ScenarioType, { title: string; description: string; modeBName: string; modeAName: string }> = {
  TASK: {
    title: '阶梯式任务省',
    description: '通过完成不同难度的任务（收藏、浏览、分享）逐步解锁更高优惠。',
    modeBName: '阶梯任务模式',
    modeAName: '直接优惠模式'
  },
  SOCIAL: {
    title: '社交组队省',
    description: '邀请好友组队，人数越多优惠力度越大。',
    modeBName: '社交组队模式',
    modeAName: '直接优惠模式'
  },
  TREASURE: {
    title: '限时寻宝省',
    description: '在限定时间内寻找页面隐藏的彩蛋，收集越多优惠越大。',
    modeBName: '限时寻宝模式',
    modeAName: '直接优惠模式'
  },
  BUNDLE: {
    title: '品类攒单省',
    description: '跨品类凑单购买，组合越多优惠越大。',
    modeBName: '品类攒单模式',
    modeAName: '直接优惠模式'
  },
  POINTS: {
    title: '积分兑换省',
    description: '购物同时累积积分，积分可直接抵扣现金或兑换权益。',
    modeBName: '积分兑换模式',
    modeAName: '直接优惠模式'
  },
  CUSTOM: {
    title: '个性化定制省',
    description: '自主选择优惠方式（领券、拼单等），定制专属优惠方案。',
    modeBName: '个性化定制模式',
    modeAName: '直接优惠模式'
  },
  BARGAIN: {
    title: '反向砍价省',
    description: '主动发起砍价挑战，通过互动博弈降低商品价格。',
    modeBName: '反向砍价模式',
    modeAName: '直接优惠模式'
  },
  CHECKIN: {
    title: '每日打卡省',
    description: '连续打卡签到，坚持天数越长优惠力度越大。',
    modeBName: '每日打卡模式',
    modeAName: '直接优惠模式'
  }
};

export const BUNDLE_ITEMS: Product[] = [
  { id: 'b1', name: '便携洗漱包', category: '日用', originalPrice: 59, discountedPrice: 39, image: 'https://picsum.photos/seed/bag/200/200', description: '防水材质，干湿分离，旅行必备。' },
  { id: 'b2', name: '纯棉运动袜', category: '服饰', originalPrice: 29, discountedPrice: 19, image: 'https://picsum.photos/seed/socks/200/200', description: '吸汗透气，舒适耐磨，运动首选。' },
  { id: 'b3', name: '数据线收纳扣', category: '数码', originalPrice: 19, discountedPrice: 9, image: 'https://picsum.photos/seed/cable/200/200', description: '告别缠绕，整洁桌面，小巧便携。' },
];

export const PRODUCTS: Product[] = [
  // 衣 (Clothing & Fashion)
  { id: 'c1', name: '重磅廓形连帽卫衣', category: '服装', originalPrice: 399, discountedPrice: 269, image: 'https://picsum.photos/seed/hoodie/600/400' },
  { id: 'c2', name: '复古德训鞋', category: '鞋履', originalPrice: 529, discountedPrice: 359, image: 'https://picsum.photos/seed/sneakers/600/400' },
  { id: 'c3', name: '极简羊毛大衣', category: '服装', originalPrice: 1299, discountedPrice: 899, image: 'https://picsum.photos/seed/coat/600/400' },
  { id: 'c4', name: '多功能机能双肩包', category: '配饰', originalPrice: 459, discountedPrice: 299, image: 'https://picsum.photos/seed/backpack/600/400' },
  { id: 'c5', name: '纯棉基础款T恤 (3件装)', category: '服装', originalPrice: 199, discountedPrice: 129, image: 'https://picsum.photos/seed/tshirt/600/400' },

  // 食 (Food & Kitchen)
  { id: 'f1', name: '多功能空气炸锅 5L', category: '厨电', originalPrice: 699, discountedPrice: 499, image: 'https://picsum.photos/seed/airfryer/600/400' },
  { id: 'f2', name: '半自动意式咖啡机', category: '厨电', originalPrice: 1599, discountedPrice: 1099, image: 'https://picsum.photos/seed/coffee/600/400' },
  { id: 'f3', name: '进口原切牛排套装', category: '生鲜', originalPrice: 399, discountedPrice: 259, image: 'https://picsum.photos/seed/steak/600/400' },
  { id: 'f4', name: '智能恒温电水壶', category: '厨电', originalPrice: 249, discountedPrice: 169, image: 'https://picsum.photos/seed/kettle/600/400' },
  { id: 'f5', name: '日式陶瓷餐具12件套', category: '家居', originalPrice: 299, discountedPrice: 189, image: 'https://picsum.photos/seed/ceramic/600/400' },

  // 住 (Housing & Living)
  { id: 'h1', name: '全棉亲肤床品四件套', category: '日用品', originalPrice: 599, discountedPrice: 399, image: 'https://picsum.photos/seed/bedding/600/400' },
  { id: 'h2', name: '极简北欧风香薰机', category: '家居', originalPrice: 189, discountedPrice: 129, image: 'https://picsum.photos/seed/diffuser/600/400' },
  { id: 'h3', name: '智能感应垃圾桶', category: '家居', originalPrice: 159, discountedPrice: 99, image: 'https://picsum.photos/seed/trashcan/600/400' },
  { id: 'h4', name: '人体工学办公椅', category: '家具', originalPrice: 899, discountedPrice: 629, image: 'https://picsum.photos/seed/chair/600/400' },
  { id: 'h5', name: '无线手持吸尘器', category: '家电', originalPrice: 1299, discountedPrice: 899, image: 'https://picsum.photos/seed/vacuum/600/400' },

  // 行 (Transportation & Travel)
  { id: 't1', name: '旗舰级无线降噪耳机', category: '数码', originalPrice: 1999, discountedPrice: 1499, image: 'https://picsum.photos/seed/headphones/600/400' },
  { id: 't2', name: '铝镁合金登机箱 20寸', category: '旅行', originalPrice: 899, discountedPrice: 599, image: 'https://picsum.photos/seed/suitcase/600/400' },
  { id: 't3', name: '便携式户外露营灯', category: '户外', originalPrice: 129, discountedPrice: 89, image: 'https://picsum.photos/seed/camping/600/400' },
  { id: 't4', name: '智能电动滑板车', category: '出行', originalPrice: 2499, discountedPrice: 1899, image: 'https://picsum.photos/seed/scooter/600/400' },
  { id: 't5', name: '车载多功能充气泵', category: '汽车', originalPrice: 199, discountedPrice: 139, image: 'https://picsum.photos/seed/pump/600/400' },
  
  // 综合 (Other/Tech)
  { id: 's1', name: '复古机械键盘 (红轴)', category: '数码', originalPrice: 459, discountedPrice: 329, image: 'https://picsum.photos/seed/keyboard/600/400' },
  { id: 's2', name: '高强度筋膜枪', category: '运动', originalPrice: 399, discountedPrice: 269, image: 'https://picsum.photos/seed/massage/600/400' }
];

export const EMOJIS = ['😫', '😕', '😐', '🙂', '🤩'];
