'use client';
import useSWR from 'swr';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import Link from 'next/link';
import { Lock } from 'lucide-react';

const fetcher = (url: string) => api.get(url).then(r => r.data);

const TYPE_ICONS: Record<string, string> = {
  exchange_in: '📥', exchange_out: '📤', transfer: '↔️', mint: '🔨', burn: '🔥',
};
const TYPE_COLORS: Record<string, string> = {
  exchange_in: '#ff6b6b', exchange_out: '#69f0ae', transfer: '#64b5f6', mint: '#ffd740', burn: '#ff6d00',
};

export default function WhalePanel() {
  const { user } = useAuthStore();
  const isPro = user?.plan === 'pro';
  const { data: txs } = useSWR(isPro ? '/whale?minUsd=500000&limit=15' : null, fetcher, { refreshInterval: 60000 });

  if (!isPro) {
    return (
      <div className="card p-6 flex flex-col items-center justify-center text-center min-h-48">
        <Lock size={32} className="text-yellow-400 mb-3" />
        <h3 className="text-white font-bold text-sm mb-1">🐋 Whale Alert</h3>
        <p className="text-white/40 text-xs mb-4">Theo dõi giao dịch cá voi lớn. Nâng cấp Pro để truy cập.</p>
        <Link href="/pricing" className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition">
          Nâng cấp Pro →
        </Link>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="px-5 py-4 border-b border-white/5">
        <h2 className="text-white font-bold text-sm">🐋 Giao dịch Whale</h2>
      </div>
      <div className="divide-y divide-white/3 max-h-96 overflow-y-auto">
        {txs?.map((tx: any) => (
          <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: `${TYPE_COLORS[tx.transactionType]}18` }}>
              {TYPE_ICONS[tx.transactionType] || '↔️'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="bg-brand-blue/15 text-brand-cyan text-xs font-bold px-1.5 py-0.5 rounded">{tx.symbol}</span>
                <span className="text-white/30 text-xs truncate">{tx.from?.owner || tx.from?.address?.slice(0, 8) + '...'}</span>
                <span className="text-white/20 text-xs">→</span>
                <span className="text-white/30 text-xs truncate">{tx.to?.owner || tx.to?.address?.slice(0, 8) + '...'}</span>
              </div>
              <div className="text-white text-xs font-mono font-semibold">{Number(tx.amount).toLocaleString()} {tx.symbol}</div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xs font-mono font-bold" style={{ color: TYPE_COLORS[tx.transactionType] }}>
                ${(tx.amountUsd / 1e6).toFixed(1)}M
              </div>
              <div className="text-white/25 text-xs">{new Date(tx.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
