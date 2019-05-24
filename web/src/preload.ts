export async function preloadVideo(src: string) {
  return new Promise<HTMLVideoElement>((resolve, reject) => {
    const item = document.createElement('video');
    item.onloadedmetadata = e => resolve(item);
    item.onerror = e => reject(e);
    item.src = src;
    item.load();
  });
}

export async function preloadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const item = new Image();
    item.onload = e => resolve(item);
    item.onerror = e => reject(e);
    item.src = src;
  });
}
