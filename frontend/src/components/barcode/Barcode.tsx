import React, { useMemo } from 'react';
import { encodeCode128B } from './code128';

interface BarcodeProps {
  value: string;
  height?: number;
  barWidth?: number;
  showText?: boolean;
  className?: string;
}

export const Barcode: React.FC<BarcodeProps> = ({
  value,
  height = 50,
  barWidth = 2,
  showText = true,
  className = '',
}) => {
  const { bars, totalWidth } = useMemo(() => {
    return encodeCode128B(value || 'N/A');
  }, [value]);

  const svgWidth = totalWidth * barWidth;
  const svgHeight = height + (showText ? 18 : 0);

  return (
    <div className={`inline-flex flex-col items-center bg-white p-2 rounded-lg select-none ${className}`}>
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        width="100%"
        height={svgHeight}
        style={{ maxWidth: `${svgWidth}px` }}
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <rect width="100%" height="100%" fill="#ffffff" />
        {bars.map((bar, idx) => (
          <rect
            key={idx}
            x={bar.x * barWidth}
            y={0}
            width={bar.width * barWidth}
            height={height}
            fill="#0f172a"
          />
        ))}

        {showText && (
          <text
            x={svgWidth / 2}
            y={height + 14}
            textAnchor="middle"
            fill="#334155"
            fontSize="12"
            fontFamily="'JetBrains Mono', monospace"
            fontWeight="600"
            letterSpacing="1.5"
          >
            {value}
          </text>
        )}
      </svg>
    </div>
  );
};
