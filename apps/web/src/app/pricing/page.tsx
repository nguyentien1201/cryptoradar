'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Check, X, Zap, CreditCard } from 'lucide-react';
import Link from 'next/link';

const FREE_FEATURES = [
  { text: '5 cảnh báo giá', ok: true },
  { text: '10 holdings danh mục', ok: true },
  { text: 'Giá realtime (1 phút)', ok: true },
  { text: 'Tin tức crypto', ok: true },
  { text: 'Whale Alert', ok: false },
  { text: 'Sentiment nâng cao', ok: false },
  { text: 'Cảnh báo Telegram', ok: false },
  { text: 'Export dữ liệu', ok: false },
];

const PRO_FEATURES = [
  { text: 'Cảnh báo không giới hạn', ok: true },
  { text: 'Holdings không giới hạn', ok: true },
  { text: 'Giá realtime (30 giây)', ok: true },
  { text: 'Tin tức crypto', ok: true },
  { text: 'Whale Alert (>$500K)', ok: true },
  { text: 'Sentiment nâng cao', ok: true },
  { text: 'Thông báo Email + Telegram', ok: true },
  { text: 'Export CSV/JSON', ok: true },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);
  const { user } = useAuthStore();
  const router = useRouter();

  const handleStripe = async () => {
    if (!user) { router.push('/login'); return; }
    setLoading('stripe');
    try {
      const { data } = await api.post('/payments/stripe/checkout', { planType: billing });
      window.location.href = data.url;
    } catch {
      toast.error('Lỗi thanh toán, thử lại sau');
    } finally {
      setLoading(null);
    }
  };

  const handleMoMo = async () => {
    if (!user) { router.push('/login'); return; }
    setLoading('momo');
    try {
      const { data } = await api.post('/payments/momo/checkout', { planType: billing });
      window.location.href = data.payUrl;
    } catch {
      toast.error('Lỗi MoMo, thử lại sau');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-6">
      <Link href="/" className="text-white/30 text-sm mb-8 hover:text-white transition">← Về Dashboard</Link>

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Chọn gói phù hợp</h1>
        <p className="text-white/40 text-sm">Bắt đầu miễn phí, nâng cấp khi cần</p>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <button onClick={() => setBilling('monthly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${billing === 'monthly' ? 'bg-brand-blue/30 text-brand-cyan' : 'text-white/40'}`}>
            Theo tháng
          </button>
          <button onClick={() => setBilling('yearly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${billing === 'yearly' ? 'bg-brand-blue/30 text-brand-cyan' : 'text-white/40'}`}>
            Theo năm <span className="text-brand-green text-xs ml-1">-25%</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {/* Free */}
        <div className="card p-6">
          <div className="mb-4">
            <div className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1">Free</div>
            <div className="text-3xl font-bold text-white">$0</div>
            <div className="text-white/30 text-xs mt-1">Mãi mãi miễn phí</div>
          </div>
          <ul className="space-y-2.5 mb-6">
            {FREE_FEATURES.map((f, i) => (
              <li key={i} className="flex items-center gap-2.5 text-xs">
                {f.ok ? <Check size={13} className="text-brand-green flex-shrink-0" /> : <X size={13} className="text-white/20 flex-shrink-0" />}
                <span className={f.ok ? 'text-white/70' : 'text-white/25 line-through'}>{f.text}</span>
              </li>
            ))}
          </ul>
          {user?.plan === 'free' ? (
            <div className="w-full text-center py-2.5 rounded-lg bg-white/5 text-white/40 text-sm font-medium">Gói hiện tại</div>
          ) : (
            <Link href="/" className="block w-full text-center py-2.5 rounded-lg bg-white/5 text-white/60 text-sm font-medium hover:bg-white/10 transition">
              Dùng miễn phí
            </Link>
          )}
        </div>

        {/* Pro */}
        <div className="relative card p-6 border-brand-blue/30 bg-gradient-to-b from-brand-blue/10 to-transparent">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-gradient-to-r from-brand-blue to-brand-cyan text-white text-xs font-bold px-3 py-1 rounded-full">Phổ biến nhất</span>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap size={14} className="text-yellow-400" />
              <div className="text-yellow-400 text-xs font-semibold uppercase tracking-wider">Pro</div>
            </div>
            {billing === 'monthly' ? (
              <div>
                <span className="text-3xl font-bold text-white">$9.99</span>
                <span className="text-white/30 text-sm">/tháng</span>
                <div className="text-white/30 text-xs mt-1">~250,000₫/tháng</div>
              </div>
            ) : (
              <div>
                <span className="text-3xl font-bold text-white">$89.99</span>
                <span className="text-white/30 text-sm">/năm</span>
                <div className="text-brand-green text-xs mt-1">Tiết kiệm $29.89 so với tháng</div>
              </div>
            )}
          </div>

          <ul className="space-y-2.5 mb-6">
            {PRO_FEATURES.map((f, i) => (
              <li key={i} className="flex items-center gap-2.5 text-xs">
                <Check size={13} className="text-brand-green flex-shrink-0" />
                <span className="text-white/80">{f.text}</span>
              </li>
            ))}
          </ul>

          {user?.plan === 'pro' ? (
            <div className="w-full text-center py-2.5 rounded-lg bg-brand-green/20 text-brand-green text-sm font-medium">✓ Đang dùng Pro</div>
          ) : (
            <div className="space-y-2">
              <button onClick={handleStripe} disabled={!!loading}
                className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 disabled:opacity-60">
                <CreditCard size={14} />
                {loading === 'stripe' ? 'Đang xử lý...' : 'Thanh toán bằng Visa/Mastercard'}
              </button>
              <button onClick={handleMoMo} disabled={!!loading}
                className="w-full py-2.5 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: 'rgba(167, 0, 122, 0.15)', border: '1px solid rgba(167,0,122,0.3)', color: '#e91e8c' }}>
                {loading === 'momo' ? 'Đang xử lý...' : '🟣 Thanh toán bằng MoMo'}
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-white/20 text-xs mt-8 text-center">
        Huỷ bất cứ lúc nào · Bảo mật thanh toán · Hỗ trợ 24/7
      </p>
    </div>
  );
}
