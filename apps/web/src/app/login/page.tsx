'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const { login, register, isLoading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.email, form.password, form.name);
      }
      toast.success(mode === 'login' ? 'Đăng nhập thành công!' : 'Tạo tài khoản thành công!');
      router.push('/');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Đã có lỗi xảy ra');
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-cyan flex items-center justify-center text-2xl font-bold mx-auto mb-3">₿</div>
          <h1 className="text-white font-bold text-xl">CryptoRadar <span className="text-brand-cyan">VN</span></h1>
          <p className="text-white/30 text-xs mt-1">Theo dõi crypto toàn diện</p>
        </div>

        <div className="card p-6">
          {/* Tab */}
          <div className="flex bg-white/5 rounded-lg p-0.5 mb-6">
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-md text-xs font-semibold transition ${mode === m ? 'bg-brand-blue/40 text-white' : 'text-white/40'}`}>
                {m === 'login' ? 'Đăng nhập' : 'Đăng ký'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="text-white/40 text-xs mb-1 block">Họ tên</label>
                <input className="input w-full" placeholder="Nguyễn Văn A" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
            )}
            <div>
              <label className="text-white/40 text-xs mb-1 block">Email</label>
              <input className="input w-full" type="email" placeholder="email@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <label className="text-white/40 text-xs mb-1 block">Mật khẩu</label>
              <input className="input w-full" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={8} />
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full mt-2 py-2.5 disabled:opacity-60">
              {isLoading ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
            </button>
          </form>

          {mode === 'login' && (
            <div className="text-center mt-4">
              <a href="/forgot-password" className="text-white/30 text-xs hover:text-white transition">Quên mật khẩu?</a>
            </div>
          )}
        </div>

        <p className="text-center text-white/20 text-xs mt-5">
          {mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
          {' '}
          <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-brand-cyan hover:opacity-80">
            {mode === 'login' ? 'Đăng ký miễn phí' : 'Đăng nhập'}
          </button>
        </p>
      </div>
    </div>
  );
}
