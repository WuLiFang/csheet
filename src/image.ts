import * as $ from 'jquery';
import { Lightbox } from './lightbox';

enum classes {
    failedThumb = 'failed-thumb',
    failedFull = 'failed-full',
    updatingThumb = 'updating-thumb',
    updatingFull = 'updating-full',
}
let currentAjax = 0;
let ajaxLimit = 5;
export class CSheetImage {
    public ratio = 1;
    public minUpdateInterval = 2000;
    private isUpdating = false;
    private isScheduled = false;
    private isloadingThumb = false;
    private isloadingFull = false;
    private retryAfter = 1000;
    private lastUpdateTime = 0;

    constructor(
        readonly uuid: string,
        public thumb: string,
        public full: string,
        public preview: string,
        public readonly lightbox: Lightbox,
    ) {
    }
    update(isScheduledTask = false) {
        if (this.isUpdating || this.isScheduled
            || new Date().getTime() - this.lastUpdateTime < this.minUpdateInterval) {
            return
        }
        if (currentAjax >= ajaxLimit) {
            if (this.isScheduled && !isScheduledTask) {
                return
            }
            if (isScheduledTask) {
                // Increase wait time for next retry.
                this.retryAfter *= 1.2;
            }
            this.isScheduled = true;
            setTimeout(() => { this.update(true) }, this.retryAfter)
        }
        currentAjax += 1;

        $.get({
            url: '/api/image/timestamp',
            data: { uuid: this.uuid },
            success: (data: ImageData) => {
                if (!data.thumb) {
                    this.onthumberror()
                } else {
                    this.thumb = `/images/${this.uuid}.thumb?timestamp=${data.thumb}`;
                    this.loadThumb();
                }
                if (!data.full) {
                    this.lightbox.$.addClass(classes.failedFull)
                } else {
                    this.full = `/images/${this.uuid}.full?timestamp=${data.full}`;
                    this.loadFull();
                }
                if (data.preview) {
                    this.preview = `/images/${this.uuid}.preview?timestamp=${data.preview}`;
                }
                // Reset wait time.
                this.retryAfter = 1000;
            },
            complete: () => {
                currentAjax -= 1;
                this.isUpdating = false;
                this.isScheduled = false;
                this.lastUpdateTime = new Date().getTime();
            }
        }
        );
    }
    loadThumb() {
        if (this.isloadingThumb || !this.thumb
            || this.lightbox.smallVideo.getAttribute('poster') == this.thumb) {
            return
        }
        this.isloadingThumb = true
        this.lightbox.$.removeClass(classes.failedThumb)
        this.lightbox.$.addClass(classes.updatingThumb)
        imageAvailable(
            this.thumb,
            (img) => {
                let src = <string>img.getAttribute('src')
                this.ratio = img.width / img.height;
                this.lightbox.smallImage.src = src;
                this.lightbox.smallVideo.poster = src;
                this.lightbox.$.removeClass(classes.updatingThumb)
                this.lightbox.expand()
                this.isloadingThumb = false
            },
            (img) => {
                let src = <string>img.getAttribute('src')
                if (src == this.lightbox.smallVideo.getAttribute('poster')) {
                    this.lightbox.shrink()
                }
                this.onthumberror()
                this.isloadingThumb = false
            }
        )
    }

    loadFull() {
        if (this.isloadingFull || !this.full
            || this.lightbox.fullVideo.getAttribute('poster') == this.full) {
            return
        }
        this.isloadingFull = true

        this.lightbox.$.removeClass(classes.failedFull)
        this.lightbox.$.addClass(classes.updatingFull)
        imageAvailable(
            this.full,
            (img) => {
                let src = <string>img.getAttribute('src')
                this.lightbox.fullImage.src = src
                this.lightbox.fullVideo.poster = src
                this.lightbox.$.removeClass(classes.updatingFull)
                this.isloadingFull = false
            },
            () => {
                this.lightbox.$.removeClass(classes.updatingFull)
                this.lightbox.$.addClass(classes.failedFull)
                this.isloadingFull = false
            }
        )
    }
    loadPreview() {
        this.loadSmallPreview()
        this.loadFullPreview()
    }
    loadSmallPreview() {
        if (this.preview) { this.lightbox.smallVideo.src = this.preview }
    }
    loadFullPreview() {
        if (this.preview) { this.lightbox.fullVideo.src = this.preview }
    }
    unloadPreview() {
        this.lightbox.smallVideo.removeAttribute('src')
        this.lightbox.smallVideo.load()
        this.lightbox.fullVideo.removeAttribute('src')
        this.lightbox.fullVideo.load()
    }
    loadInfo() {
        $.get(
            `images/${this.uuid}.info`,
            (data: string) => {
                let detail = this.lightbox.$.find('.detail')
                detail.html(data)
                let self = this;
                (<JQuery<HTMLTableDataCellElement>>detail.find('td.notes')).click(
                    function () { self.loadNote($(this).data('pipeline')) }
                )
            }
        );
    }
    onthumberror() {
        this.lightbox.$.removeClass(classes.updatingThumb)
        this.lightbox.$.addClass(classes.failedThumb)
        if (!(this.lightbox.smallVideo.getAttribute('poster')
            || this.lightbox.smallVideo.getAttribute('src'))) {
            this.lightbox.shrink()
        }
    }
    loadNote(pipeline: string) {
        $.get(
            `/images/${this.uuid}.notes/${pipeline}`,
            (data) => {
                let $data = $(data);
                let content = $data.find('.note-html p').html();
                let serverIP = $data.find('.note-html').data('serverIp');
                $data.find('.note-html').replaceWith(content);
                // Redirect img src to other server.
                (<JQuery<HTMLImageElement>>$data.find('img')).each(
                    function () {
                        let src = $(this).attr('src');
                        if (!src) {
                            return
                        }
                        this.src = src.replace('/upload', `http://${serverIP}/upload`);
                    }
                );
                this.lightbox.$.find('.note-container').html($data.html());
            }
        );
    }
}

interface ImageData {
    thumb?: string
    full?: string
    preview?: string
}

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