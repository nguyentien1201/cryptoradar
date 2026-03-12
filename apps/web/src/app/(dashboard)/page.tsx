'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PortfolioOverview from '@/components/dashboard/PortfolioOverview';
import MarketOverview from '@/components/dashboard/MarketOverview';
import AlertsPanel from '@/components/dashboard/AlertsPanel';
import FearGreedWidget from '@/components/dashboard/FearGreedWidget';
import NewsPanel from '@/components/dashboard/NewsPanel';
import WhalePanel from '@/components/dashboard/WhalePanel';

export default function DashboardPage() {
  const { user, refreshUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    refreshUser();
  }, []);

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="grid grid-cols-12 gap-4">
        {/* Row 1: Portfolio + Fear&Greed */}
        <div className="col-span-12 lg:col-span-8">
          <PortfolioOverview />
        </div>
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <FearGreedWidget />
          <AlertsPanel compact />
        </div>

        {/* Row 2: Market */}
        <div className="col-span-12">
          <MarketOverview />
        </div>

        {/* Row 3: News + Whale */}
        <div className="col-span-12 lg:col-span-7">
          <NewsPanel />
        </div>
        <div className="col-span-12 lg:col-span-5">
          <WhalePanel />
        </div>
      </div>
    </DashboardLayout>
  );
}
