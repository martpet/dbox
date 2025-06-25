export function getResponsiveMediaStyles(width: number, height: number) {
  const MAX_HEIGHT = 500;
  const usedHeight = Math.min(height, MAX_HEIGHT);
  const aspectRatio = Number((height / width).toFixed(4));

  return {
    aspectRatio: `1/${aspectRatio}`,
    width: Math.round(usedHeight / aspectRatio),
  };
}
