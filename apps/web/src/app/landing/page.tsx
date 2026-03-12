import Link from 'next/link';
import { Metadata } from 'next';
import { TrendingUp, Bell, Waves, Newspaper, BarChart3, Shield, Zap, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'CryptoRadar VN — Công cụ Crypto Tốt Nhất Cho Nhà Đầu Tư Việt Nam',
  description: 'Theo dõi danh mục crypto, cảnh báo giá tức thì, whale alert realtime, phân tích sentiment. Được tin dùng bởi hàng nghìn nhà đầu tư Việt Nam.',
};

const FEATURES = [
  { icon: TrendingUp, title: 'Theo dõi Danh mục', desc: 'Tự động tính P&L, phân bổ tài sản theo thời gian thực. Biết ngay lãi lỗ bao nhiêu.', color: '#00e676' },
  { icon: Bell, title: 'Cảnh báo Giá', desc: 'Đặt alert khi coin vượt/dưới mức giá bạn muốn. Nhận thông báo qua Email + Telegram.', color: '#ffd740' },
  { icon: Waves, title: 'Whale Alert', desc: 'Theo dõi giao dịch cá voi > $500K. Biết khi nào whale di chuyển coin bạn đang hold.', color: '#64b5f6', pro: true },
  { icon: Newspaper, title: 'Sentiment & Tin tức', desc: 'Feed tin tức lọc theo coin bạn theo dõi. Điểm Bullish/Bearish tự động.', color: '#b388ff', pro: true },
  { icon: BarChart3, title: 'Biểu đồ nến', desc: 'Chart candlestick real-time từ Binance WebSocket. Không trễ, không giới hạn.', color: '#ff6b35' },
  { icon: Shield, title: 'Bảo mật tuyệt đối', desc: 'Dữ liệu mã hoá end-to-end. Không lưu private key, không kết nối ví.', color: '#00b4d8' },
];

const STATS = [
  { value: '5,000+', label: 'Nhà đầu tư' },
  { value: '50+', label: 'Loại coin' },
  { value: '99.9%', label: 'Uptime' },
  { value: '<1s', label: 'Độ trễ cảnh báo' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-900">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-blue to-brand-cyan flex items-center justify-center font-bold">₿</div>
          <span className="font-bold text-white">CryptoRadar <span className="text-brand-cyan">VN</span></span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-white/50 text-sm hover:text-white transition">Đăng nhập</Link>
          <Link href="/login" className="btn-primary text-sm py-1.5 px-4">Dùng miễn phí</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-blue/10 border border-brand-blue/20 rounded-full px-3 py-1.5 text-brand-cyan text-xs font-medium mb-6">
          <Zap size={12} /> Cập nhật giá realtime từ Binance & CoinGecko
        </div>

        <h1 className="text-5xl font-bold text-white leading-tight mb-4">
          Công cụ Crypto<br />
          <span className="bg-gradient-to-r from-brand-blue to-brand-cyan bg-clip-text text-transparent">
            Toàn diện cho người Việt
          </span>
        </h1>

        <p className="text-white/50 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Theo dõi danh mục, cảnh báo giá tức thì, whale alert realtime và phân tích sentiment —
          tất cả trong một nền tảng đơn giản, tiếng Việt.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/login" className="btn-primary px-8 py-3 text-base">🚀 Bắt đầu miễn phí</Link>
          <Link href="/pricing" className="btn-ghost px-8 py-3 text-base">Xem giá →</Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 max-w-2xl mx-auto mt-20">
          {STATS.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-bold text-white font-mono">{s.value}</div>
              <div className="text-white/30 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-white text-center mb-10">Tính năng nổi bật</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div key={i} className="card p-5 hover:border-white/10 transition group">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${f.color}18` }}>
                  <f.icon size={20} style={{ color: f.color }} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold text-sm">{f.title}</h3>
                    {f.pro && <span className="pro-badge">PRO</span>}
                  </div>
                  <p className="text-white/40 text-xs leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="card p-10 bg-gradient-to-b from-brand-blue/10 to-transparent">
          <Users size={32} className="text-brand-cyan mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">Tham gia cộng đồng nhà đầu tư Việt</h2>
          <p className="text-white/40 text-sm mb-6">Miễn phí. Không cần thẻ ngân hàng. Bắt đầu trong 30 giây.</p>
          <Link href="/login" className="btn-primary px-10 py-3 text-base inline-block">
            Tạo tài khoản miễn phí
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8 text-center text-white/20 text-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <span>© 2024 CryptoRadar VN. Không phải tư vấn tài chính.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white transition">Chính sách</Link>
            <Link href="/terms" className="hover:text-white transition">Điều khoản</Link>
            <a href="https://t.me/cryptoradarvn" className="hover:text-white transition">Telegram</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
