import React, { useState } from "react";
import {
  formatCurrency,
  formatNumber,
  formatDateTime,
} from "../../utils/formatters";
import {
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/outline";

const PositionsTable = ({ positions = [], onClose }) => {
  const [sortField, setSortField] = useState("openTime");
  const [sortDirection, setSortDirection] = useState("desc");
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  if (!positions || positions.length === 0) {
    return (
      <div className="text-center py-12 bg-navy-light rounded-lg border border-gold-light">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-lg font-medium text-gold mb-2 font-raleway-semibold">
          No Open Positions
        </h3>
        <p className="text-gold-light font-raleway-regular">
          Your open positions will appear here
        </p>
      </div>
    );
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows);
    if (expandedRows.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getFilteredPositions = () => {
    let filtered = [...positions];

    if (filter !== "all") {
      filtered = filtered.filter(
        (p) => p.type.toLowerCase() === filter.toLowerCase(),
      );
    }

    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return filtered;
  };

  const getSortedPositions = () => {
    const filtered = getFilteredPositions();

    return filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === "profitLoss") {
        aVal = a.profitLoss;
        bVal = b.profitLoss;
      }

      if (sortField === "openTime") {
        aVal = new Date(a.openTime).getTime();
        bVal = new Date(b.openTime).getTime();
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  const sortedPositions = getSortedPositions();

  const totalProfitLoss = positions.reduce(
    (sum, pos) => sum + (pos.profitLoss || 0),
    0,
  );
  const totalVolume = positions.reduce(
    (sum, pos) => sum + (pos.volume || 0),
    0,
  );

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUpIcon className="h-4 w-4 inline ml-1 text-gold" />
    ) : (
      <ChevronDownIcon className="h-4 w-4 inline ml-1 text-gold" />
    );
  };

  return (
    <div className="space-y-4 font-raleway">
      {/* Summary Bar */}
      <div className="flex flex-wrap justify-between items-center p-4 bg-navy-light rounded-lg border border-gold-light">
        <div className="flex flex-wrap gap-6">
          <div>
            <span className="text-sm text-gold-light">Total Positions</span>
            <p className="text-lg font-semibold text-gold">
              {positions.length}
            </p>
          </div>
          <div>
            <span className="text-sm text-gold-light">Total Volume</span>
            <p className="text-lg font-semibold text-gold">
              {formatNumber(totalVolume)} lots
            </p>
          </div>
          <div>
            <span className="text-sm text-gold-light">Total P/L</span>
            <p
              className={`text-lg font-semibold ${
                totalProfitLoss >= 0 ? "text-gold" : "text-red-500"
              }`}
            >
              {formatCurrency(totalProfitLoss)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search symbol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1 bg-navy border border-gold-light rounded-lg text-gold text-sm focus:border-gold focus:outline-none font-raleway-regular"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1 bg-navy border border-gold-light rounded-lg text-gold text-sm focus:border-gold focus:outline-none font-raleway-regular"
          >
            <option value="all">All Types</option>
            <option value="buy">Buy Only</option>
            <option value="sell">Sell Only</option>
          </select>
        </div>
      </div>

      {/* Table - Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gold-light">
          <thead className="bg-navy-light">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gold uppercase tracking-wider cursor-pointer hover:bg-navy-lighter transition-colors font-raleway-semibold"
                onClick={() => handleSort("symbol")}
              >
                Symbol <SortIcon field="symbol" />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gold uppercase tracking-wider cursor-pointer hover:bg-navy-lighter transition-colors font-raleway-semibold"
                onClick={() => handleSort("type")}
              >
                Type <SortIcon field="type" />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gold uppercase tracking-wider cursor-pointer hover:bg-navy-lighter transition-colors font-raleway-semibold"
                onClick={() => handleSort("volume")}
              >
                Volume <SortIcon field="volume" />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gold uppercase tracking-wider cursor-pointer hover:bg-navy-lighter transition-colors font-raleway-semibold"
                onClick={() => handleSort("openPrice")}
              >
                Open Price <SortIcon field="openPrice" />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gold uppercase tracking-wider cursor-pointer hover:bg-navy-lighter transition-colors font-raleway-semibold"
                onClick={() => handleSort("currentPrice")}
              >
                Current <SortIcon field="currentPrice" />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gold uppercase tracking-wider cursor-pointer hover:bg-navy-lighter transition-colors font-raleway-semibold"
                onClick={() => handleSort("profitLoss")}
              >
                P/L <SortIcon field="profitLoss" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gold uppercase tracking-wider font-raleway-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-navy divide-y divide-gold-light">
            {sortedPositions.map((position) => (
              <React.Fragment key={position.id}>
                <tr className="table-row-hover">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleRow(position.id)}
                      className="flex items-center space-x-2 text-sm font-medium text-gold hover:text-gold-light transition-colors font-raleway-medium"
                    >
                      <span>{position.symbol}</span>
                      {expandedRows.has(position.id) ? (
                        <ChevronUpIcon className="h-4 w-4 text-gold" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4 text-gold" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        position.type === "BUY"
                          ? "bg-gold bg-opacity-20 text-gold border border-gold"
                          : "bg-red-500 bg-opacity-20 text-red-500 border border-red-500"
                      } font-raleway-semibold`}
                    >
                      {position.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gold font-raleway-regular">
                    {formatNumber(position.volume)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gold font-raleway-regular">
                    {formatNumber(position.openPrice, 5)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gold font-raleway-regular">
                    {formatNumber(position.currentPrice, 5)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`text-sm font-medium font-raleway-semibold ${
                        position.profitLoss >= 0 ? "text-gold" : "text-red-500"
                      }`}
                    >
                      {formatCurrency(position.profitLoss)}
                      <br />
                      <span className="text-xs">
                        ({position.profitLossPercentage?.toFixed(2)}%)
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onClose && onClose(position.id)}
                      className="text-red-500 hover:text-red-400 transition-colors"
                      title="Close Position"
                    >
                      <XCircleIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
                {expandedRows.has(position.id) && (
                  <tr className="bg-navy-light">
                    <td colSpan="7" className="px-6 py-4">
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gold-light">Open Time:</span>
                          <p className="font-medium text-gold">
                            {formatDateTime(position.openTime)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gold-light">Stop Loss:</span>
                          <p className="font-medium text-gold">
                            {position.stopLoss || "Not set"}
                          </p>
                        </div>
                        <div>
                          <span className="text-gold-light">Take Profit:</span>
                          <p className="font-medium text-gold">
                            {position.takeProfit || "Not set"}
                          </p>
                        </div>
                        <div>
                          <span className="text-gold-light">Commission:</span>
                          <p className="font-medium text-gold">
                            {formatCurrency(position.commission || 0)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gold-light">Swap:</span>
                          <p className="font-medium text-gold">
                            {formatCurrency(position.swap || 0)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gold-light">Margin:</span>
                          <p className="font-medium text-gold">
                            {formatCurrency(position.margin || 0)}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-4">
        {sortedPositions.map((position) => (
          <div
            key={position.id}
            className="bg-navy-light rounded-lg border border-gold-light p-4"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold text-gold">
                    {position.symbol}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      position.type === "BUY"
                        ? "bg-gold bg-opacity-20 text-gold border border-gold"
                        : "bg-red-500 bg-opacity-20 text-red-500 border border-red-500"
                    }`}
                  >
                    {position.type}
                  </span>
                </div>
                <p className="text-sm text-gold-light mt-1">
                  Volume: {formatNumber(position.volume)} lots
                </p>
              </div>
              <button
                onClick={() => onClose && onClose(position.id)}
                className="text-red-500 hover:text-red-400"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gold-light">Open Price</p>
                <p className="text-gold font-medium">
                  {formatNumber(position.openPrice, 5)}
                </p>
              </div>
              <div>
                <p className="text-gold-light">Current</p>
                <p className="text-gold font-medium">
                  {formatNumber(position.currentPrice, 5)}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-gold-light">P/L</p>
                <p
                  className={`text-base font-semibold ${
                    position.profitLoss >= 0 ? "text-gold" : "text-red-500"
                  }`}
                >
                  {formatCurrency(position.profitLoss)}
                  <span className="text-sm ml-2">
                    ({position.profitLossPercentage?.toFixed(2)}%)
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={() => toggleRow(position.id)}
              className="w-full mt-3 flex items-center justify-center space-x-2 text-gold-light hover:text-gold transition-colors"
            >
              <span className="text-sm">
                {expandedRows.has(position.id)
                  ? "Hide Details"
                  : "Show Details"}
              </span>
              {expandedRows.has(position.id) ? (
                <ChevronUpIcon className="h-4 w-4" />
              ) : (
                <ChevronDownIcon className="h-4 w-4" />
              )}
            </button>

            {expandedRows.has(position.id) && (
              <div className="mt-3 pt-3 border-t border-gold-light grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gold-light">Open Time</p>
                  <p className="text-gold">
                    {formatDateTime(position.openTime)}
                  </p>
                </div>
                <div>
                  <p className="text-gold-light">Stop Loss</p>
                  <p className="text-gold">{position.stopLoss || "Not set"}</p>
                </div>
                <div>
                  <p className="text-gold-light">Take Profit</p>
                  <p className="text-gold">
                    {position.takeProfit || "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-gold-light">Commission</p>
                  <p className="text-gold">
                    {formatCurrency(position.commission || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-gold-light">Swap</p>
                  <p className="text-gold">
                    {formatCurrency(position.swap || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-gold-light">Margin</p>
                  <p className="text-gold">
                    {formatCurrency(position.margin || 0)}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PositionsTable;
