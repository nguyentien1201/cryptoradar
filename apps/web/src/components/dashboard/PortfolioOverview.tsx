'use client';
import useSWR from 'swr';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import api from '@/lib/api';
import { TrendingUp, TrendingDown, Plus, Loader } from 'lucide-react';
import Link from 'next/link';

const fetcher = (url: string) => api.get(url).then(r => r.data);

const COLORS = ['#1a73e8', '#00b4d8', '#00e676', '#ffd740', '#ff6b35', '#b388ff', '#f06292', '#4db6ac'];

export default function PortfolioOverview() {
  const { data: stats, isLoading } = useSWR('/portfolio/stats', fetcher, { refreshInterval: 30000 });

  if (isLoading) return (
    <div className="card p-6 flex items-center justify-center h-64">
      <Loader className="animate-spin text-brand-cyan" size={24} />
    </div>
  );

  const isEmpty = !stats?.holdings?.length;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-white font-bold text-base">💼 Danh mục đầu tư</h2>
        <Link href="/portfolio/add" className="btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3">
          <Plus size={13} /> Thêm coin
        </Link>
      </div>

      {isEmpty ? (
        <div className="text-center py-12 text-white/30">
          <TrendingUp size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Chưa có tài sản nào</p>
          <Link href="/portfolio/add" className="btn-primary inline-flex mt-3 text-xs py-1.5 px-4">+ Thêm coin đầu tiên</Link>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          {/* Stats */}
          <div className="col-span-12 md:col-span-7 space-y-4">
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Tổng giá trị', value: `$${stats.totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, color: 'text-brand-cyan' },
                { label: 'Lãi / Lỗ', value: `${stats.totalPnl >= 0 ? '+' : ''}$${Math.abs(stats.totalPnl).toFixed(0)}`, color: stats.totalPnl >= 0 ? 'text-brand-green' : 'text-brand-red' },
                { label: '% P&L', value: `${stats.totalPnlPercent >= 0 ? '+' : ''}${stats.totalPnlPercent.toFixed(2)}%`, color: stats.totalPnlPercent >= 0 ? 'text-brand-green' : 'text-brand-red' },
              ].map((s, i) => (
                <div key={i} className="bg-white/4 rounded-xl p-3 text-center">
                  <div className="text-white/40 text-xs mb-1">{s.label}</div>
                  <div className={`font-mono font-bold text-sm ${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Holdings list */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {stats.holdings?.slice(0, 8).map((h: any, i: number) => (
                <div key={i} className="flex items-center justify-between bg-white/3 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-blue to-brand-cyan flex items-center justify-center text-xs font-bold">
                      {h.coinSymbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-white text-xs font-semibold">{h.coinSymbol}</div>
                      <div className="text-white/30 text-xs font-mono">{Number(h.amount).toFixed(4)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-xs font-mono">${h.currentValue?.toFixed(0)}</div>
                    <div className={`text-xs ${h.pnlPercent >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
                      {h.pnlPercent >= 0 ? '▲' : '▼'}{Math.abs(h.pnlPercent).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pie chart */}
          <div className="col-span-12 md:col-span-5">
            <div className="text-white/40 text-xs mb-2 text-center">Phân bổ tài sản</div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={stats.allocation} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" strokeWidth={0}>
                  {stats.allocation.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0d1526', border: '1px solid rgba(100,181,246,0.2)', borderRadius: 8 }}
                  formatter={(val: any, name: any, props: any) => [`${props.payload.percent.toFixed(1)}%`, props.payload.symbol]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 justify-center">
              {stats.allocation.slice(0, 5).map((a: any, i: number) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-white/50 text-xs">{a.symbol} {a.percent.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
