// FearGreedWidget.tsx
'use client';
import useSWR from 'swr';
import api from '@/lib/api';

const fetcher = (url: string) => api.get(url).then(r => r.data);

export function FearGreedWidget() {
  const { data } = useSWR('/news/fear-greed', fetcher, { refreshInterval: 3600000 });
  const current = data?.[0];
  const value = current?.value || 50;

  const getColor = (v: number) => v < 25 ? '#ff1744' : v < 45 ? '#ff6d00' : v < 55 ? '#ffd740' : v < 75 ? '#69f0ae' : '#00e676';
  const getLabel = (v: number) => v < 25 ? 'Sợ hãi cực độ' : v < 45 ? 'Sợ hãi' : v < 55 ? 'Trung lập' : v < 75 ? 'Tham lam' : 'Tham lam cực độ';

  const angle = -135 + (value / 100) * 270;
  const color = getColor(value);

  return (
    <div className="card p-4 text-center">
      <div className="text-white/40 text-xs mb-2">Fear & Greed Index</div>
      <svg viewBox="-60 -60 220 140" className="w-36 mx-auto" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="gauge" x1="0%" y1="0%" x2="100%">
            <stop offset="0%" stopColor="#ff1744" />
            <stop offset="50%" stopColor="#ffd740" />
            <stop offset="100%" stopColor="#00e676" />
          </linearGradient>
        </defs>
        <path d="M0,0 A50,50 0 0,1 100,0" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" transform="rotate(-135, 50, 0)" />
        <path d="M0,0 A50,50 0 0,1 100,0" fill="none" stroke="url(#gauge)" strokeWidth="10" transform="rotate(-135, 50, 0)" strokeLinecap="round" />
        <g transform={`rotate(${angle}, 50, 0)`}>
          <line x1="50" y1="0" x2="50" y2="-42" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="50" cy="0" r="5" fill="white" />
        </g>
        <text x="50" y="18" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">{value}</text>
      </svg>
      <div className="font-bold text-sm mt-1" style={{ color }}>{getLabel(value)}</div>
      {data?.length > 1 && (
        <div className="flex justify-center gap-1 mt-2">
          {data.slice(0, 7).map((d: any, i: number) => (
            <div key={i} title={`${d.value} - ${new Date(d.timestamp).toLocaleDateString('vi-VN')}`}
              className="w-2 rounded-sm"
              style={{ height: `${(d.value / 100) * 24 + 4}px`, background: getColor(d.value), opacity: i === 0 ? 1 : 0.4 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default FearGreedWidget;
