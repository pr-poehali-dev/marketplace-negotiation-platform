interface QRCardProps {
  value: string;       // код (BUY-xxxx или SHOP-xxxx)
  label: string;       // подпись под кодом
  title: string;       // заголовок карточки
  color?: string;      // цвет акцента (tailwind класс)
  size?: number;
}

// SVG QR-code визуализация (паттерн на основе хэша строки)
function generateQRPattern(value: string): boolean[][] {
  const size = 21;
  const grid: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Угловые маркеры (3 угла)
  const addFinder = (row: number, col: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const onEdge = r === 0 || r === 6 || c === 0 || c === 6;
        const onInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        if (onEdge || onInner) grid[row + r][col + c] = true;
      }
    }
  };
  addFinder(0, 0);
  addFinder(0, 14);
  addFinder(14, 0);

  // Данные на основе значения
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  }
  for (let r = 8; r < size; r++) {
    for (let c = 8; c < size; c++) {
      if (r >= 14 && c <= 6) continue;
      hash = ((hash * 1103515245 + 12345) & 0x7fffffff);
      grid[r][c] = (hash % 2) === 0;
    }
  }

  return grid;
}

export default function QRCard({ value, label, title, size = 140 }: QRCardProps) {
  const pattern = generateQRPattern(value);
  const cellSize = size / 21;

  return (
    <div className="bg-white border-2 border-border rounded-2xl p-5 text-center">
      <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">{title}</p>

      {/* QR SVG */}
      <div className="flex justify-center mb-3">
        <div className="p-3 border-2 border-border rounded-xl bg-white inline-block">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="block"
          >
            {pattern.map((row, r) =>
              row.map((cell, c) =>
                cell ? (
                  <rect
                    key={`${r}-${c}`}
                    x={c * cellSize}
                    y={r * cellSize}
                    width={cellSize}
                    height={cellSize}
                    fill="#1a1a2e"
                    rx={cellSize * 0.15}
                  />
                ) : null
              )
            )}
            {/* Центральный лого */}
            <rect
              x={size / 2 - 14}
              y={size / 2 - 14}
              width={28}
              height={28}
              rx={6}
              fill="hsl(24, 95%, 53%)"
            />
            <text
              x={size / 2}
              y={size / 2 + 5}
              textAnchor="middle"
              fill="white"
              fontSize={10}
              fontWeight="900"
              fontFamily="system-ui"
            >
              О'
            </text>
          </svg>
        </div>
      </div>

      {/* Code */}
      <div className="font-black text-xl text-primary tracking-widest mb-1">{value}</div>
      <p className="text-xs text-muted-foreground">{label}</p>

      {/* Share button */}
      <button className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mx-auto transition-colors">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        Поделиться магазином
      </button>
    </div>
  );
}
