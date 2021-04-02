export default async function screenshotElements(
  elements: (HTMLVideoElement | HTMLImageElement | SVGSVGElement)[],
  type = 'image/jpeg',
  quality = 1
): Promise<Blob | null> {
  if (elements.length === 0) {
    return null;
  }
  const canvas = document.createElement('canvas');
  for (const el of elements) {
    let w = 0;
    let h = 0;
    if (el instanceof HTMLVideoElement) {
      w = el.videoWidth;
      h = el.videoHeight;
    } else if (el instanceof HTMLImageElement) {
      w = el.naturalWidth;
      h = el.naturalHeight;
    } else if (el instanceof SVGSVGElement) {
      w = el.viewBox.baseVal.width;
      h = el.viewBox.baseVal.height;
    }
    canvas.width = Math.max(w, canvas.width);
    canvas.height = Math.max(h, canvas.height);
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2d context not supported ');
  }

  for (const el of elements) {
    if (el instanceof HTMLVideoElement || el instanceof HTMLImageElement) {
      ctx.drawImage(el, 0, 0, canvas.width, canvas.height);
    }
    if (el instanceof SVGSVGElement) {
      const svg = new Blob([new XMLSerializer().serializeToString(el)], {
        type: 'image/svg+xml',
      });
      await new Promise((resolve) => {
        const src = URL.createObjectURL(svg);
        const img = document.createElement('img');
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(src);
          resolve();
        };
        img.src = src;
      });
    }
  }

  return new Promise((resolve) => {
    canvas.toBlob(
      (v) => {
        resolve(v);
      },
      type,
      quality
    );
  });
}
