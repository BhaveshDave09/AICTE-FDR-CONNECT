import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: {
    text: string;
    variant: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  };
  trend?: string;
  onClick?: () => void;
  accentColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  trend,
  onClick,
  accentColor = '#174B80'
}) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl border border-[#E5E7EB] p-4 sm:p-5 shadow-xs transition-all duration-150 ${
        onClick ? 'cursor-pointer hover:shadow-sm hover:border-gray-300' : ''
      }`}
    >
      <div className="flex items-center justify-between text-xs font-medium text-[#737985] mb-2">
        <span className="truncate uppercase tracking-wider">{title}</span>
        {Icon && (
          <div 
            className="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-50 border border-gray-100"
            style={{ color: accentColor }}
          >
            <Icon size={16} />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="text-2xl sm:text-[28px] font-semibold text-[#24262B] font-tabular tracking-tight">
          {value}
        </div>
        {badge && (
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
            badge.variant === 'success' ? 'bg-[#E8F5EE] text-[#2A674E]' :
            badge.variant === 'warning' ? 'bg-[#FEF7ED] text-[#B45309]' :
            badge.variant === 'error' ? 'bg-[#FDF2F2] text-[#B91C1C]' :
            badge.variant === 'info' ? 'bg-[#EFF6FF] text-[#1E40AF]' :
            'bg-gray-100 text-gray-600'
          }`}>
            {badge.text}
          </span>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2 flex items-center justify-between text-xs text-[#737985]">
          <span className="truncate">{subtitle}</span>
          {trend && <span className="font-medium text-emerald-600">{trend}</span>}
        </div>
      )}
    </div>
  );
};
