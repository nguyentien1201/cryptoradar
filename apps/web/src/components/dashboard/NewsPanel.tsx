// NewsPanel.tsx
'use client';
import useSWR from 'swr';
import { useState } from 'react';
import api from '@/lib/api';
import { ExternalLink } from 'lucide-react';
import clsx from 'clsx';

const fetcher = (url: string) => api.get(url).then(r => r.data);

const FILTERS = ['all', 'bullish', 'bearish', 'neutral'];
const SENT_COLORS: Record<string, string> = { bullish: '#00e676', bearish: '#ff1744', neutral: '#ffd740', important: '#64b5f6' };
const SENT_LABELS: Record<string, string> = { bullish: '📈 Tích cực', bearish: '📉 Tiêu cực', neutral: '➡️ Trung tính', important: '⚡ Quan trọng' };

export function NewsPanel() {
  const [filter, setFilter] = useState('all');
  const { data: news } = useSWR(`/news?filter=${filter}`, fetcher, { refreshInterval: 600000 });

  return (
    <div className="card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <h2 className="text-white font-bold text-sm">📰 Tin tức Crypto</h2>
        <div className="flex gap-1.5">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={clsx('px-2.5 py-1 rounded text-xs font-medium transition capitalize',
                filter === f ? 'bg-brand-blue/25 text-brand-cyan' : 'text-white/30 hover:text-white')}>
              {f === 'all' ? 'Tất cả' : f === 'bullish' ? 'Tích cực' : f === 'bearish' ? 'Tiêu cực' : 'Trung tính'}
            </button>
          ))}
        </div>
      </div>
      <div className="divide-y divide-white/3 max-h-96 overflow-y-auto">
        {news?.slice(0, 10).map((item: any) => (
          <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
            className="flex gap-3 px-5 py-3 hover:bg-white/3 transition group">
            <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: SENT_COLORS[item.sentiment] || '#ffd740' }} />
            <div className="flex-1 min-w-0">
              <div className="text-white/90 text-xs font-medium leading-relaxed group-hover:text-white transition line-clamp-2">{item.title}</div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-white/30 text-xs">{item.source}</span>
                <span className="text-white/20 text-xs">·</span>
                <span className="text-white/30 text-xs">{new Date(item.publishedAt).toLocaleDateString('vi-VN')}</span>
                {item.currencies?.slice(0, 2).map((c: string) => (
                  <span key={c} className="bg-brand-blue/10 text-brand-cyan text-xs px-1.5 py-0.5 rounded font-bold">{c}</span>
                ))}
                <span className="ml-auto text-xs" style={{ color: SENT_COLORS[item.sentiment] }}>{SENT_LABELS[item.sentiment]}</span>
              </div>
            </div>
            <ExternalLink size={12} className="text-white/20 group-hover:text-white/40 flex-shrink-0 mt-1" />
          </a>
        ))}
      </div>
    </div>
  );
}

export default NewsPanel;
