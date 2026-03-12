// AccountSummary.js
import React from "react";
import { formatCurrency, formatPercentage } from "../../utils/formatters";
import { RefreshIcon } from "@heroicons/react/outline";

const AccountSummary = ({ data, onRefresh }) => {
  const metrics = [
    {
      label: "Balance",
      value: data.balance,
      tooltip: "Total account balance",
      icon: "💰",
      borderColor: "border-gold",
    },
    {
      label: "Equity",
      value: data.equity,
      tooltip: "Balance + unrealized P/L",
      icon: "📊",
      borderColor: "border-gold",
    },
    {
      label: "Margin",
      value: data.margin,
      tooltip: "Used margin",
      icon: "🔒",
      borderColor: "border-gold",
    },
    {
      label: "Free Margin",
      value: data.freeMargin,
      tooltip: "Available for new trades",
      icon: "💸",
      borderColor: "border-gold",
    },
    {
      label: "Profit/Loss",
      value: data.profitLoss,
      tooltip: "Unrealized profit/loss",
      icon: data.profitLoss >= 0 ? "📈" : "📉",
      borderColor: data.profitLoss >= 0 ? "border-gold" : "border-red-500",
      change: data.profitLossPercentage,
    },
    {
      label: "Margin Level",
      value: (data.equity / data.margin) * 100,
      tooltip: "Equity / Margin * 100",
      icon: "⚖️",
      isPercentage: true,
      borderColor: "border-gold",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header with Refresh */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gold">Account Summary</h2>
        <button
          onClick={onRefresh}
          className="p-2 hover:bg-navy-lighter rounded-full transition-colors text-gold hover:text-gold-light"
          title="Refresh data"
        >
          <RefreshIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={`relative p-4 rounded-lg border ${metric.borderColor} bg-navy-light hover:bg-navy-lighter transition-all hover:shadow-gold`}
            title={metric.tooltip}
          >
            {/* Icon and Label */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{metric.icon}</span>
              <span className="text-xs font-medium text-gold-light uppercase tracking-wider">
                {metric.label}
              </span>
            </div>

            {/* Value */}
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gold">
                {metric.isPercentage
                  ? formatPercentage(metric.value)
                  : formatCurrency(metric.value)}
              </p>

              {/* Change indicator for P/L */}
              {metric.change !== undefined && (
                <div
                  className={`flex items-center space-x-1 text-sm ${
                    metric.change >= 0 ? "text-gold" : "text-red-500"
                  }`}
                >
                  <span>{metric.change >= 0 ? "↑" : "↓"}</span>
                  <span>{formatPercentage(Math.abs(metric.change))}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Additional Info Bar */}
      <div className="bg-navy-light rounded-lg p-3 text-sm text-gold-light border border-gold-light">
        <div className="flex flex-wrap gap-4">
          <span>📊 Total Trades: 24</span>
          <span>✅ Winning Trades: 15 (62.5%)</span>
          <span>❌ Losing Trades: 9 (37.5%)</span>
          <span>🏆 Best Trade: +$450</span>
          <span>📉 Worst Trade: -$120</span>
        </div>
      </div>
    </div>
  );
};

export default AccountSummary;
