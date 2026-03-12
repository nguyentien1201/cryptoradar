// AlertsPanel
'use client';
import useSWR from 'swr';
import Link from 'next/link';
import api from '@/lib/api';
import { Bell, BellOff, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const fetcher = (url: string) => api.get(url).then(r => r.data);

export default function AlertsPanel({ compact = false }: { compact?: boolean }) {
  const { data: alerts, mutate } = useSWR('/alerts', fetcher);

  const deleteAlert = async (id: string) => {
    try {
      await api.delete(`/alerts/${id}`);
      mutate();
      toast.success('Đã xoá cảnh báo');
    } catch {
      toast.error('Lỗi khi xoá');
    }
  };

  const toggleAlert = async (id: string) => {
    try {
      await api.put(`/alerts/${id}/toggle`);
      mutate();
    } catch { }
  };

  const activeAlerts = alerts?.filter((a: any) => a.status !== 'triggered') || [];

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold text-sm">🔔 Cảnh báo giá</h3>
        <Link href="/alerts/new" className="text-brand-cyan text-xs hover:opacity-80 flex items-center gap-1">
          <Plus size={12} /> Thêm
        </Link>
      </div>

      {!activeAlerts.length ? (
        <div className="text-center py-5 text-white/30 text-xs">
          <Bell size={24} className="mx-auto mb-2 opacity-30" />
          <p>Chưa có cảnh báo nào</p>
        </div>
      ) : (
        <div className="space-y-2">
          {activeAlerts.slice(0, compact ? 4 : undefined).map((alert: any) => (
            <div key={alert.id} className="flex items-center justify-between bg-white/3 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${alert.status === 'active' ? 'bg-brand-green animate-pulse' : 'bg-white/20'}`} />
                <span className="text-brand-cyan text-xs font-bold">{alert.coinSymbol}</span>
                <span className="text-white/40 text-xs">{alert.condition === 'above' ? '≥' : '≤'}</span>
                <span className="text-white text-xs font-mono">${Number(alert.targetPrice).toLocaleString()}</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => toggleAlert(alert.id)} className="text-white/30 hover:text-white transition p-1">
                  {alert.status === 'active' ? <Bell size={12} /> : <BellOff size={12} />}
                </button>
                <button onClick={() => deleteAlert(alert.id)} className="text-white/30 hover:text-red-400 transition p-1">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
          {compact && activeAlerts.length > 4 && (
            <Link href="/alerts" className="text-white/30 text-xs hover:text-white text-center block py-1">
              +{activeAlerts.length - 4} thêm
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
