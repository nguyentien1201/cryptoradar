'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { LayoutDashboard, TrendingUp, Bell, Newspaper, Waves, Settings, LogOut, Zap } from 'lucide-react';
import clsx from 'clsx';

const NAV_ITEMS = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/portfolio', icon: TrendingUp, label: 'Danh mục' },
  { href: '/alerts', icon: Bell, label: 'Cảnh báo' },
  { href: '/market', icon: TrendingUp, label: 'Thị trường' },
  { href: '/news', icon: Newspaper, label: 'Tin tức' },
  { href: '/whale', icon: Waves, label: 'Whale Alert', proOnly: true },
  { href: '/settings', icon: Settings, label: 'Cài đặt' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <div className="flex min-h-screen bg-dark-900">
      {/* Sidebar */}
      <aside className="w-60 fixed top-0 left-0 h-full bg-dark-800 border-r border-white/5 flex flex-col z-50">
        {/* Logo */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-blue to-brand-cyan flex items-center justify-center font-bold text-lg">₿</div>
            <div>
              <div className="font-bold text-white text-sm leading-tight">CryptoRadar</div>
              <div className="text-brand-cyan text-xs font-semibold">VN</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const isLocked = item.proOnly && user?.plan !== 'pro';
            return (
              <Link key={item.href} href={isLocked ? '/pricing' : item.href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-brand-blue/20 text-brand-cyan border border-brand-blue/30'
                    : 'text-white/50 hover:text-white hover:bg-white/5',
                )}>
                <item.icon size={16} />
                <span>{item.label}</span>
                {isLocked && <span className="ml-auto text-xs text-yellow-400">PRO</span>}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-white/5">
          {/* Upgrade CTA for free users */}
          {user?.plan === 'free' && (
            <Link href="/pricing"
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-gradient-to-r from-yellow-500/15 to-orange-500/15 border border-yellow-500/20 text-yellow-400 text-xs font-semibold mb-3 hover:opacity-90 transition">
              <Zap size={14} />
              Nâng cấp Pro
            </Link>
          )}
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-brand-cyan flex items-center justify-center text-xs font-bold">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-semibold truncate">{user?.name}</div>
              <div className="flex items-center gap-1">
                {user?.plan === 'pro' ? (
                  <span className="pro-badge">PRO</span>
                ) : (
                  <span className="text-white/30 text-xs">Free</span>
                )}
              </div>
            </div>
            <button onClick={logout} className="text-white/30 hover:text-red-400 transition">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-60 flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
