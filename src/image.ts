/**
 * Load image in background.
 * @param url image url.
 * @param onload callback.
 * @param onerror callback.
 */

type imageLoadCallback = (img: HTMLImageElement) => void;

export function imageAvailable(
    url: string,
    onload?: imageLoadCallback,
    onerror?: imageLoadCallback,
) {
    const temp = new Image();
    if (onload) {
        temp.onload = () => { onload(temp); };
    }
    if (onerror) {
        temp.onerror = () => { onerror(temp); };
    }
    temp.src = url;
}
