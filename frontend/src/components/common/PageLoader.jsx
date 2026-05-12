import React from "react";

const PageLoader = () => {
  return (
    <div className="min-h-screen bg-[#000F29] flex items-center justify-center px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
        <p className="text-white/60 text-sm tracking-[0.2em] uppercase font-bold">
          Loading TikTrades
        </p>
      </div>
    </div>
  );
};

export default PageLoader;
