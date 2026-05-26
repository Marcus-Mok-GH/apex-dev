var NARROW_THRESHOLD = 60;
function useLayout() {
  const { width } = useTerminalDimensions();
  const w2 = width || 80;
  const isNarrow = w2 < NARROW_THRESHOLD;
  return {
    width: w2,
    isNarrow,
    indent: isNarrow ? 2 : 4,
    smallIndent: isNarrow ? 1 : 2
  };
}

