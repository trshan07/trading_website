import React, { useEffect, useRef, useState } from "react";

const DeferredSection = ({
  children,
  className = "",
  minHeightClassName = "min-h-[320px]",
}) => {
  const containerRef = useRef(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const node = containerRef.current;

    if (!node || shouldRender) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px" }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [shouldRender]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ contentVisibility: shouldRender ? "visible" : "auto" }}
    >
      {shouldRender ? (
        children
      ) : (
        <div
          className={`rounded-[2rem] border border-white/5 bg-white/[0.02] ${minHeightClassName}`}
        />
      )}
    </div>
  );
};

export default DeferredSection;
