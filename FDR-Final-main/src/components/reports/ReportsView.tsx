import React from 'react';
import { Download } from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { FdrInstrument, PortalKpiSummary } from '../../types';

interface ReportsViewProps {
  fdrs: FdrInstrument[];
  kpis: PortalKpiSummary;
  onExportCsv: () => void;
}

const COLORS = ['#174B80', '#3F9876', '#E5A548', '#D9534F', '#8B5CF6', '#06B6D4', '#EC4899'];

export const ReportsView: React.FC<ReportsViewProps> = ({
  fdrs,
  kpis,
  onExportCsv
}) => {
  // Region-wise aggregate
  const regionStats: Record<string, { count: number; totalAmount: number }> = {};
  fdrs.forEach(f => {
    if (!regionStats[f.region]) regionStats[f.region] = { count: 0, totalAmount: 0 };
    regionStats[f.region].count += 1;
    regionStats[f.region].totalAmount += f.principalAmount;
  });

  const regionChartData = Object.entries(regionStats).map(([region, val]) => ({
    name: region,
    instruments: val.count,
    amountCrores: Number((val.totalAmount / 10000000).toFixed(2))
  }));

  // Bank distribution
  const bankStats: Record<string, number> = {};
  fdrs.forEach(f => {
    bankStats[f.bankName] = (bankStats[f.bankName] || 0) + 1;
  });

  const bankChartData = Object.entries(bankStats).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#24262B]">
              Regulatory Reports & Compliance Analytics
            </h1>
            <span className="text-[11px] font-semibold bg-blue-50 text-[#174B80] border border-blue-200 px-2.5 py-0.5 rounded-full">
              Nationwide Overview
            </span>
          </div>
          <p className="text-xs text-[#737985] mt-1">
            Official statutory analytics for deposit reserves, regional distribution, bank concentrations, and verification velocity.
          </p>
        </div>

        <button
          onClick={onExportCsv}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#174B80] hover:bg-[#153f6c] text-white transition-colors shadow-2xs"
        >
          <Download size={14} />
          <span>Download Comprehensive CSV</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-xs font-semibold text-gray-500 uppercase">Total Deposit Reserves</span>
          <div className="text-2xl font-bold text-gray-900 font-tabular mt-1">
            ₹{(kpis.totalDepositValue / 10000000).toFixed(2)} Cr
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Guaranteed across {kpis.totalFdrCount} FDRs</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-xs font-semibold text-gray-500 uppercase">Avg Verification Velocity</span>
          <div className="text-2xl font-bold text-gray-900 font-tabular mt-1">
            4.2 Days
          </div>
          <span className="text-[11px] text-gray-500">From request to branch endorsement</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-xs font-semibold text-gray-500 uppercase">Verification Rate</span>
          <div className="text-2xl font-bold text-emerald-700 font-tabular mt-1">
            {((kpis.verifiedCount / (kpis.totalFdrCount || 1)) * 100).toFixed(1)}%
          </div>
          <span className="text-[11px] text-gray-500">{kpis.verifiedCount} Instruments Confirmed</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-xs font-semibold text-gray-500 uppercase">Discrepancy Resolution Rate</span>
          <div className="text-2xl font-bold text-blue-900 font-tabular mt-1">
            87.5%
          </div>
          <span className="text-[11px] text-gray-500">Auto-flagged & resolved</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Regional Deposit Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Regional Bureau Deposit Reserves (Crores INR)</h3>
          <p className="text-xs text-gray-500 mb-4">Total face value locked by regional jurisdiction office.</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#737985' }} angle={-20} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#737985' }} />
                <Tooltip 
                  formatter={(val: any) => [`₹${val} Cr`, 'Deposit Value']}
                  contentStyle={{ backgroundColor: '#25252A', color: '#FFF', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="amountCrores" fill="#174B80" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Issuing Bank Concentration */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Scheduled Bank Concentration</h3>
            <p className="text-xs text-gray-500 mb-4">Distribution of fixed deposits across public & private scheduled commercial banks.</p>
            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bankChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }: any) => `${name.substring(0, 10)} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {bankChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#25252A', color: '#FFF', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 border-t border-gray-100 text-xs">
            {bankChartData.map((b, i) => (
              <div key={b.name} className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-gray-700 truncate">{b.name}: <strong>{b.value}</strong></span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
