'use client';
import useSWR from 'swr';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import api from '@/lib/api';
import { Loader } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const fetcher = (url: string) => api.get(url).then(r => r.data);

export default function MarketOverview() {
  const [page, setPage] = useState(1);
  const { data: coins, isLoading } = useSWR(`/prices/market?page=${page}&per_page=20`, fetcher, { refreshInterval: 60000 });

  return (
    <div className="card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <h2 className="text-white font-bold text-base">📊 Thị trường</h2>
        <div className="flex gap-2">
          {[1, 2, 3].map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-7 h-7 rounded text-xs font-medium transition ${page === p ? 'bg-brand-blue/30 text-brand-cyan' : 'text-white/30 hover:text-white'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-12 gap-3 px-5 py-2 text-white/30 text-xs font-medium border-b border-white/5">
        <div className="col-span-1">#</div>
        <div className="col-span-3">Coin</div>
        <div className="col-span-2 text-right">Giá</div>
        <div className="col-span-2 text-right">24h</div>
        <div className="col-span-2 text-right">Vốn hoá</div>
        <div className="col-span-2 text-right">7 ngày</div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader className="animate-spin text-brand-cyan" size={20} /></div>
      ) : (
        <div className="divide-y divide-white/3">
          {coins?.map((coin: any, i: number) => (
            <Link href={`/coin/${coin.id}`} key={coin.id}
              className="grid grid-cols-12 gap-3 px-5 py-3 items-center hover:bg-white/3 transition group">
              <div className="col-span-1 text-white/30 text-xs">{(page - 1) * 20 + i + 1}</div>
              <div className="col-span-3 flex items-center gap-2.5">
                {coin.image && (
                  <Image src={coin.image} alt={coin.symbol} width={24} height={24} className="rounded-full" />
                )}
                <div>
                  <div className="text-white text-xs font-semibold group-hover:text-brand-cyan transition">{coin.symbol.toUpperCase()}</div>
                  <div className="text-white/30 text-xs truncate max-w-20">{coin.name}</div>
                </div>
              </div>
              <div className="col-span-2 text-right font-mono text-xs text-white">
                ${coin.current_price > 1000
                  ? coin.current_price.toLocaleString('en-US', { maximumFractionDigits: 0 })
                  : coin.current_price > 1
                    ? coin.current_price.toFixed(3)
                    : coin.current_price.toFixed(6)}
              </div>
              <div className={`col-span-2 text-right text-xs font-mono ${coin.price_change_percentage_24h >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
                {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
              </div>
              <div className="col-span-2 text-right text-xs text-white/40 font-mono">
                ${(coin.market_cap / 1e9).toFixed(2)}B
              </div>
              <div className="col-span-2 flex justify-end">
                {coin.sparkline_in_7d?.price?.length > 0 && (
                  <ResponsiveContainer width={80} height={32}>
                    <LineChart data={coin.sparkline_in_7d.price.slice(-30).map((v: number, i: number) => ({ v }))}>
                      <Line type="monotone" dataKey="v" stroke={coin.price_change_percentage_7d >= 0 ? '#00e676' : '#ff1744'} dot={false} strokeWidth={1.5} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
