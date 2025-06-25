export function getResponsiveMediaStyles(width: number, height: number) {
  const aspectRatio = Number((width / height).toFixed(4));
  const maxHeight = 500;
  const usedHeight = Math.min(height, maxHeight);

  return {
    aspectRatio: `${aspectRatio}`,
    width: Math.round(usedHeight * aspectRatio),
  };
}
