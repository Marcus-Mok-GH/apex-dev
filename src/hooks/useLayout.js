var COMPACT_THRESHOLD = 48;
var NARROW_THRESHOLD = 68;
function useLayout() {
  const { width } = useTerminalDimensions();
  const w2 = Math.max(width || 80, 20);
  const isCompact = w2 < COMPACT_THRESHOLD;
  const isNarrow = w2 < NARROW_THRESHOLD;
  return {
    width: w2,
    isCompact,
    isNarrow,
    indent: isCompact ? 1 : isNarrow ? 2 : 4,
    smallIndent: isCompact ? 1 : isNarrow ? 1 : 2,
    contentWidth: Math.max(w2 - (isCompact ? 2 : isNarrow ? 4 : 8), 12)
  };
}

globalThis.useLayout = useLayout;
module.exports = { useLayout };
