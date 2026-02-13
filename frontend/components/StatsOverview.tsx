import React from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useLanguage } from './LanguageContext';

const StatsOverview: React.FC = () => {
  const { t } = useLanguage();

  // Mock data to match the screenshot structure
  const corporaData = [
  // --- Pre-Sales (售前) ---
  { name: 'Product Availability', sentences: '3,500', percent: '23.3' },   // 询问库存
  { name: 'Price Negotiation', sentences: '1,800', percent: '12.0' },      // 议价/砍价
  { name: 'Product Specifications', sentences: '1,100', percent: '7.3' },  // 商品规格咨询
  
  // --- Logistics (物流) ---
  { name: 'Order Tracking', sentences: '2,800', percent: '18.7' },         // 物流追踪/催发货
  { name: 'Shipping Address', sentences: '1,200', percent: '8.0' },        // 修改地址
  
  // --- After-Sales (售后) ---
  { name: 'Returns & Refunds', sentences: '2,100', percent: '14.0' },      // 退换货/退款
  { name: 'Damaged Goods Claims', sentences: '600', percent: '4.0' },      // 损坏索赔
  
  // --- Marketing & Others (营销与其他) ---
  { name: 'Promotions & Vouchers', sentences: '900', percent: '6.0' },     // 优惠券/促销咨询
  { name: 'Customer Complaints', sentences: '500', percent: '3.3' },       // 客户投诉
  { name: 'Product Reviews', sentences: '300', percent: '2.0' },           // 评价管理
  
  // --- Special Features (特色数据) ---
  { name: 'Rojak Language (Mixed)', sentences: '800', percent: '5.3' },    // 混合语/语码转换
  { name: 'Chit-chat & Greetings', sentences: '400', percent: '2.7' },     // 闲聊/问候
];

  return (
    <div className="w-full bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Left Column: Text Overview */}
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-slate-900 font-mono tracking-tight leading-tight">
              {t('overviewTitle')} <br />
              <span className="text-primary-600">{t('opusCollection')}</span>
            </h2>

            <div className="space-y-6">
                <div>
                    <div className="text-2xl font-bold text-primary-600 font-mono">10+</div>
                    <div className="text-sm font-bold text-primary-400 uppercase tracking-wider font-mono">{t('corpora')}</div>
                </div>

                <div>
                    <div className="text-2xl font-bold text-primary-600 font-mono">1,291,203</div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-wider font-mono">{t('totalPairs')}</div>
                </div>

                <div>
                    <div className="text-2xl font-bold text-primary-600 font-mono">5+</div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-wider font-mono">{t('languagesAvailable')}</div>
                </div>
            </div>

            <div className="pt-4 max-w-md">
                <p className="text-slate-500 font-mono text-sm leading-relaxed uppercase">
                    {t('tableNote')}
                </p>
            </div>
          </div>

          {/* Right Column: Data Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                <div className="col-span-6">{t('corpus')}</div>
                <div className="col-span-3 text-right">{t('sentences')}</div>
                <div className="col-span-3 text-right">{t('percent')}</div>
            </div>

            {/* Table Body - Scrollable */}
            <div className="overflow-y-auto flex-grow custom-scrollbar">
                {corporaData.map((item, index) => (
                    <div 
                        key={item.name} 
                        className={`grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-50 items-center hover:bg-primary-50 transition-colors group cursor-default ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                    >
                        <div className="col-span-6 font-mono text-sm font-medium text-primary-600 group-hover:text-primary-700 flex items-center">
                            {item.name}
                            <ArrowUpRight size={12} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="col-span-3 text-right font-mono text-sm text-slate-600">
                            {item.sentences}
                        </div>
                        <div className="col-span-3 text-right font-mono text-sm text-slate-600">
                            {item.percent}
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Tiny decoration at bottom of table */}
            <div className="h-1 bg-gradient-to-r from-primary-400 to-blue-200"></div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StatsOverview;