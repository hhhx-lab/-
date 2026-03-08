import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  LayoutGrid, BarChart3, FileText, Download, Users, 
  TrendingUp, PieChart, ArrowUpRight, Lock, CheckCircle2,
  Search, Filter, Share2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { SCENARIOS } from './constants';

export function EnterpriseDashboard({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'scenarios' | 'strategy' | 'resources'>('overview');

  // Mock Data
  const overviewStats = [
    { label: '总样本量', value: '12,584', change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '全域转化提升', value: '24.8%', change: '+5.2%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Z世代占比', value: '88%', change: '+2%', icon: PieChart, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: '报告生成数', value: '156', change: '+8', icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const scenarioData = Object.entries(SCENARIOS).map(([key, info]) => ({
    id: key,
    name: info.title,
    samples: Math.floor(Math.random() * 1000) + 200,
    conversion: (Math.random() * 20 + 10).toFixed(1) + '%',
    status: Math.random() > 0.5 ? 'Ready' : 'Collecting'
  }));

  const trendData = [
    { name: 'Mon', users: 400, conversion: 24 },
    { name: 'Tue', users: 300, conversion: 13 },
    { name: 'Wed', users: 200, conversion: 38 },
    { name: 'Thu', users: 278, conversion: 39 },
    { name: 'Fri', users: 189, conversion: 48 },
    { name: 'Sat', users: 239, conversion: 38 },
    { name: 'Sun', users: 349, conversion: 43 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="bg-stone-50 min-h-screen p-6"
    >
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-stone-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-stone-900 rounded-lg text-white">
            <LayoutGrid size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-900">Z-Gen Insight</h1>
            <p className="text-xs text-stone-500">Enterprise Admin Dashboard</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onBack} className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors">
            返回用户视角
          </button>
          <button className="px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 transition-colors flex items-center gap-2">
            <Download size={16} /> 导出全域数据
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-6 mb-8 border-b border-stone-200 px-2">
        {[
          { id: 'overview', label: '全域概览' },
          { id: 'scenarios', label: '场景分析报告' },
          { id: 'strategy', label: '商业战略报告' },
          { id: 'resources', label: '落地资源包' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 text-sm font-medium transition-all relative ${
              activeTab === tab.id ? 'text-stone-900' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900" />
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {overviewStats.map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                      <stat.icon size={20} />
                    </div>
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                      <ArrowUpRight size={12} /> {stat.change}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-stone-900 mb-1">{stat.value}</div>
                  <div className="text-xs text-stone-500">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                <h3 className="font-bold text-stone-800 mb-6">用户增长趋势</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#a8a29e'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#a8a29e'}} />
                      <Tooltip />
                      <Area type="monotone" dataKey="users" stroke="#4f46e5" fillOpacity={1} fill="url(#colorUsers)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                <h3 className="font-bold text-stone-800 mb-6">场景转化率对比</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scenarioData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#a8a29e'}} interval={0} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#a8a29e'}} />
                      <Tooltip />
                      <Bar dataKey="samples" fill="#1c1917" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'scenarios' && (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center">
              <h3 className="font-bold text-stone-800">场景维度商业分析报告</h3>
              <div className="flex gap-2">
                <button className="p-2 text-stone-400 hover:text-stone-600"><Search size={18} /></button>
                <button className="p-2 text-stone-400 hover:text-stone-600"><Filter size={18} /></button>
              </div>
            </div>
            <table className="w-full text-sm text-left">
              <thead className="bg-stone-50 text-stone-500 font-medium">
                <tr>
                  <th className="px-6 py-4">场景名称</th>
                  <th className="px-6 py-4">样本量</th>
                  <th className="px-6 py-4">转化提升</th>
                  <th className="px-6 py-4">状态</th>
                  <th className="px-6 py-4">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {scenarioData.map((scenario) => (
                  <tr key={scenario.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-stone-900">{scenario.name}</td>
                    <td className="px-6 py-4 text-stone-600">{scenario.samples}</td>
                    <td className="px-6 py-4 text-green-600 font-medium">+{scenario.conversion}</td>
                    <td className="px-6 py-4">
                      {scenario.status === 'Ready' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                          <CheckCircle2 size={12} /> Report Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-medium">
                          <Users size={12} /> Collecting
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        disabled={scenario.status !== 'Ready'}
                        className="text-indigo-600 font-medium hover:text-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        生成报告
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'strategy' && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-stone-200 border-dashed">
            <div className="p-4 bg-stone-100 rounded-full mb-4">
              <Lock size={32} className="text-stone-400" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-2">全域综合商业战略报告</h3>
            <p className="text-stone-500 text-sm max-w-md text-center mb-6">
              需要所有 8 个场景的样本量均达到 2000+ 才能解锁此高级战略报告。目前进度：15%
            </p>
            <div className="w-64 h-2 bg-stone-100 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-stone-900 w-[15%]"></div>
            </div>
            <span className="text-xs text-stone-400">3,245 / 16,000 Samples</span>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: '优惠活动策划全模板', type: 'Excel', size: '2.4 MB' },
              { title: 'Z世代优惠触达文案库', type: 'PPT', size: '15.8 MB' },
              { title: '全渠道落地执行时间表', type: 'Excel', size: '1.2 MB' },
              { title: '数据监测可视化模板', type: 'Tableau', size: '4.5 MB' },
              { title: '优惠体系迭代优化手册', type: 'PDF', size: '8.9 MB' },
            ].map((res, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 hover:border-indigo-200 hover:shadow-md transition-all group cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <FileText size={20} />
                  </div>
                  <span className="text-xs text-stone-400">{res.size}</span>
                </div>
                <h4 className="font-bold text-stone-900 mb-1">{res.title}</h4>
                <p className="text-xs text-stone-500 mb-4">{res.type} Template</p>
                <button className="w-full py-2 border border-stone-200 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors flex items-center justify-center gap-2">
                  <Download size={14} /> 下载资源
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
