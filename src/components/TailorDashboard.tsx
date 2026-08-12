'use client';

import React, { useState } from 'react';
import { TailorOrder } from '@/types/measurement';
import { Scissors, Search, Plus, Shirt, UserCheck, CheckCircle2, ArrowUpRight } from 'lucide-react';

interface TailorDashboardProps {
  onSelectScan: () => void;
}

export const TailorDashboard: React.FC<TailorDashboardProps> = ({ onSelectScan }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [orders] = useState<TailorOrder[]>([
    {
      orderId: 'ORD-8091',
      customerName: 'Marcus Vance',
      customerPhone: '+1 (555) 234-5678',
      garmentType: 'Suit',
      status: 'In Cutting',
      scanId: 'SC-901',
      date: '2026-08-08',
      assignedTailor: 'Master Tailor Pietro',
    },
    {
      orderId: 'ORD-8092',
      customerName: 'Sophia Lin',
      customerPhone: '+1 (555) 876-5432',
      garmentType: 'Lehenga',
      status: 'Fitting Ready',
      scanId: 'SC-902',
      date: '2026-08-09',
      assignedTailor: 'Elena Rostova',
    },
    {
      orderId: 'ORD-8093',
      customerName: 'Aarav Sharma',
      customerPhone: '+91 98765 43210',
      garmentType: 'Sherwani',
      status: 'Pending',
      scanId: 'SC-903',
      date: '2026-08-10',
      assignedTailor: 'Rajesh Kumar',
    },
  ]);

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.orderId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ord.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto sm:max-w-3xl">
      {/* Header Banner */}
      <div className="wellness-card-green p-6 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-[#0d484b]" />
            <h2 className="text-xl font-extrabold text-[#1a2e30]">Tailor Order Dashboard</h2>
          </div>

          <button
            onClick={onSelectScan}
            className="px-4 py-2 rounded-full bg-[#0d484b] text-white text-xs font-bold shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Scan</span>
          </button>
        </div>
        <p className="text-xs text-[#5b7173]">Manage client garment cutting orders and AI fit profiles.</p>
      </div>

      {/* Summary Metric Cards (Pastel Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="wellness-card p-4 flex flex-col justify-between">
          <div className="text-xs text-[#5b7173] font-sans">Active Orders</div>
          <div className="text-2xl font-black text-[#1a2e30] mt-1">{orders.length}</div>
        </div>

        <div className="wellness-card-pink p-4 flex flex-col justify-between">
          <div className="text-xs text-[#1a2e30] font-sans">In Cutting</div>
          <div className="text-2xl font-black text-[#e88ab4] mt-1">
            {orders.filter((o) => o.status === 'In Cutting').length}
          </div>
        </div>

        <div className="wellness-card-lavender p-4 flex flex-col justify-between">
          <div className="text-xs text-[#1a2e30] font-sans">Fitting Ready</div>
          <div className="text-2xl font-black text-[#8b5cf6] mt-1">
            {orders.filter((o) => o.status === 'Fitting Ready').length}
          </div>
        </div>

        <div className="wellness-card-green p-4 flex flex-col justify-between">
          <div className="text-xs text-[#1a2e30] font-sans">Scans Logged</div>
          <div className="text-2xl font-black text-[#0d484b] mt-1">128</div>
        </div>
      </div>

      {/* Main Orders Table Container */}
      <div className="wellness-card p-5 flex flex-col gap-4">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-[#1a2e30]/10">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#5b7173] absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search client name or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-[#ebf3f2] border border-[#1a2e30]/10 text-xs text-[#1a2e30] outline-none font-medium"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {['all', 'Pending', 'In Cutting', 'Fitting Ready', 'Completed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  statusFilter === st
                    ? 'bg-[#0d484b] text-white shadow'
                    : 'bg-[#ebf3f2] text-[#5b7173] hover:text-[#1a2e30]'
                }`}
              >
                {st === 'all' ? 'All Orders' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="responsive-table-wrapper rounded-2xl overflow-hidden border border-[#1a2e30]/10">
          <table className="w-full text-left text-xs text-[#1a2e30] min-w-[620px]">
            <thead className="bg-[#ebf3f2] text-[#5b7173] uppercase font-mono text-[10px] border-b border-[#1a2e30]/10">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Garment</th>
                <th className="py-3 px-4">Assigned Master</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a2e30]/10 font-medium">
              {filteredOrders.map((ord) => (
                <tr key={ord.orderId} className="hover:bg-[#ebf3f2]/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0d484b]">{ord.orderId}</td>
                  <td className="py-3.5 px-4 font-bold text-[#1a2e30]">{ord.customerName}</td>
                  <td className="py-3.5 px-4 text-[#5b7173]">{ord.garmentType}</td>
                  <td className="py-3.5 px-4 text-[#5b7173]">{ord.assignedTailor}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap inline-block ${
                        ord.status === 'In Cutting'
                          ? 'bg-[#fce8f3] text-[#e88ab4]'
                          : ord.status === 'Fitting Ready'
                          ? 'bg-[#ece7f9] text-[#8b5cf6]'
                          : 'bg-[#dcf2eb] text-[#0d484b]'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={onSelectScan}
                      className="px-3 py-1.5 rounded-full bg-[#ebf3f2] hover:bg-[#dcf2eb] text-[#0d484b] text-xs font-bold inline-flex items-center gap-1 transition-all"
                    >
                      <span>View Specs</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
