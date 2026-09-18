import React, { useMemo } from 'react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
  showCenterIcon?: boolean;
}

// Deterministic pseudo-random matrix generator based on string hash for authentic QR representation
export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  size = 140,
  className = '',
  showCenterIcon = true
}) => {
  const matrixSize = 25; // 25x25 QR grid (Version 2)

  const grid = useMemo(() => {
    // Basic hash
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }

    const cells: boolean[][] = Array(matrixSize)
      .fill(false)
      .map(() => Array(matrixSize).fill(false));

    // Fill corner finder patterns (7x7 eyes)
    const drawFinderPattern = (startX: number, startY: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (
            r === 0 || r === 6 || c === 0 || c === 6 || // Outer ring
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)      // Inner square
          ) {
            cells[startY + r][startX + c] = true;
          } else {
            cells[startY + r][startX + c] = false;
          }
        }
      }
    };

    drawFinderPattern(0, 0); // Top-left
    drawFinderPattern(matrixSize - 7, 0); // Top-right
    drawFinderPattern(0, matrixSize - 7); // Bottom-left

    // Timing patterns
    for (let i = 8; i < matrixSize - 8; i++) {
      cells[6][i] = i % 2 === 0;
      cells[i][6] = i % 2 === 0;
    }

    // Pseudo-random data modules derived from text
    let seed = Math.abs(hash) + 12345;
    const nextRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    for (let r = 0; r < matrixSize; r++) {
      for (let c = 0; c < matrixSize; c++) {
        // Skip finder pattern zones
        const inTopLeft = r < 8 && c < 8;
        const inTopRight = r < 8 && c >= matrixSize - 8;
        const inBottomLeft = r >= matrixSize - 8 && c < 8;
        const inCenterLogo = showCenterIcon && r >= 10 && r <= 14 && c >= 10 && c <= 14;

        if (inTopLeft || inTopRight || inBottomLeft || inCenterLogo) {
          continue;
        }

        // Incorporate character values
        const charIdx = (r * matrixSize + c) % value.length;
        const charCode = value.charCodeAt(charIdx);
        cells[r][c] = (nextRandom() > 0.45) !== (charCode % 2 === 0);
      }
    }

    return cells;
  }, [value, matrixSize, showCenterIcon]);

  const cellSize = size / matrixSize;

  return (
    <div className={`relative inline-block bg-white p-2 rounded border border-slate-300 shadow-xs ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="block"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width={size} height={size} fill="#ffffff" />
        {grid.map((row, r) =>
          row.map((active, c) => {
            if (!active) return null;
            return (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize + 0.2}
                height={cellSize + 0.2}
                fill="#0f172a"
              />
            );
          })
        )}
      </svg>
      {showCenterIcon && (
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ width: size, height: size, left: '8px', top: '8px' }}
        >
          <div className="w-7 h-7 bg-white rounded-full border border-blue-900 shadow-sm flex items-center justify-center p-0.5">
            <div className="w-5 h-5 rounded-full bg-blue-900 flex items-center justify-center text-[9px] font-bold text-amber-300 tracking-tighter">
              LGU
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
