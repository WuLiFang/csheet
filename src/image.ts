/**
 * Load image in background.
 * @param url image url.
 * @param onload callback.
 * @param onerror callback.
 */
export function imageAvailable(
    url: string,
    onload = (img: HTMLImageElement) => { },
    onerror = (img: HTMLImageElement) => { }
) {
    let temp = new Image;
    temp.onload = () => { onload(temp); };
    temp.onerror = () => { onerror(temp); };
    temp.src = url;
}