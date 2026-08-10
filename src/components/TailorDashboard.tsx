'use client';

import React, { useState } from 'react';
import { TailorOrder } from '@/types/measurement';
import { Scissors, Search, Plus, FileText, CheckCircle2, Clock, Shirt, UserCheck, ArrowUpRight } from 'lucide-react';

interface TailorDashboardProps {
  onSelectScan: () => void;
}

export const TailorDashboard: React.FC<TailorDashboardProps> = ({ onSelectScan }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [orders, setOrders] = useState<TailorOrder[]>([
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
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Active Garment Orders</div>
            <div className="text-2xl font-bold text-slate-100 mt-1">{orders.length}</div>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Shirt className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">In Cutting Room</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">
              {orders.filter((o) => o.status === 'In Cutting').length}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <Scissors className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Ready for Fitting</div>
            <div className="text-2xl font-bold text-purple-400 mt-1">
              {orders.filter((o) => o.status === 'Fitting Ready').length}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Completed Scans</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">128</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Order Workflow List */}
      <div className="flex flex-col gap-4 p-6 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Scissors className="w-5 h-5 text-cyan-400" />
              <span>Tailor Order & Pattern Cutting Management</span>
            </h2>
            <p className="text-xs text-slate-400">Manage client custom tailoring jobs and AI scan measurements.</p>
          </div>

          <button
            onClick={onSelectScan}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>New AI Body Scan</span>
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search customer name or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-cyan-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            {['all', 'Pending', 'In Cutting', 'Fitting Ready', 'Completed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  statusFilter === st
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                {st === 'all' ? 'All Orders' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/50 mt-2">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Garment</th>
                <th className="py-3 px-4">Assigned Master</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredOrders.map((ord) => (
                <tr key={ord.orderId} className="hover:bg-slate-900/60">
                  <td className="py-3 px-4 font-mono font-bold text-cyan-400">{ord.orderId}</td>
                  <td className="py-3 px-4 font-semibold text-slate-100">{ord.customerName}</td>
                  <td className="py-3 px-4">{ord.garmentType}</td>
                  <td className="py-3 px-4 text-slate-400">{ord.assignedTailor}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        ord.status === 'In Cutting'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : ord.status === 'Fitting Ready'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={onSelectScan}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1 transition-all"
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
