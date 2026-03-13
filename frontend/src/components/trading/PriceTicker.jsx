// frontend/src/components/trading/PriceTicker.jsx
import React, { useState, useEffect } from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const PriceTicker = ({ data }) => {
  const [prices, setPrices] = useState(data);
  const [trends, setTrends] = useState({});

  useEffect(() => {
    // Simulate WebSocket connection
    const interval = setInterval(() => {
      setPrices(prev => {
        const newPrices = {};
        Object.keys(prev).forEach(symbol => {
          const change = (Math.random() - 0.5) * 0.001;
          const newPrice = prev[symbol].price * (1 + change);
          newPrices[symbol] = {
            ...prev[symbol],
            price: newPrice,
            change: (newPrice - prev[symbol].price) / prev[symbol].price * 100
          };
          
          setTrends(prevTrends => ({
            ...prevTrends,
            [symbol]: change > 0 ? 'up' : 'down'
          }));
        });
        return newPrices;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-navy-900 border-b border-gold-500/20 py-2 overflow-hidden">
      <div className="animate-ticker flex whitespace-nowrap">
        {Object.entries(prices).map(([symbol, data], idx) => (
          <div key={idx} className="inline-flex items-center mx-4">
            <span className="text-gold-500 font-medium mr-2">{symbol}:</span>
            <span className="text-white">
              ${typeof data.price === 'number' ? data.price.toFixed(2) : data.price}
            </span>
            <span className={`ml-2 text-xs flex items-center ${
              trends[symbol] === 'up' ? 'text-green-400' : 
              trends[symbol] === 'down' ? 'text-red-400' : 'text-gold-500/50'
            }`}>
              {trends[symbol] === 'up' ? <FaArrowUp size={10} className="mr-1" /> : 
               trends[symbol] === 'down' ? <FaArrowDown size={10} className="mr-1" /> : null}
              {data.change ? (data.change > 0 ? '+' : '') + data.change.toFixed(2) + '%' : '0.00%'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriceTicker;