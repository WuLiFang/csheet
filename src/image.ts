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
    private share = 1;
    private lastUpdateTime = 0;

    constructor(
        readonly uuid: string,
        public thumb: string,
        public full: string,
        public preview: string,
        public readonly lightbox: Lightbox,
    ) {
    }
    update(isScheduledTask = false, isLoad = true) {
        // Skip for packed page.
        if (location.protocol == 'file:') {
            return
        }
        // Skip for already updated recently.
        if (this.isUpdating || new Date().getTime() - this.lastUpdateTime < this.minUpdateInterval) {
            return
        }
        // Schedule update later if busy.
        if (currentAjax >= ajaxLimit * this.share) {
            if (this.isScheduled && !isScheduledTask) {
                return
            }
            if (isScheduledTask) {
                // Increase wait time for next retry.
                this.share *= 1.2;
            }
            this.isScheduled = true;
            setTimeout(() => { this.update(true) }, 1000)
            return
        }
        currentAjax += 1;

        $.get({
            url: '/api/video/mtime',
            data: { uuid: this.uuid },
            success: (data: ImageData) => {
                if (!data.thumb) {
                    this.onthumberror()
                } else {
                    this.thumb = `/videos/${this.uuid}.thumb?timestamp=${data.thumb}`;
                    if (isLoad) {
                        this.loadThumb();
                    }
                }
                if (!data.full) {
                    this.lightbox.$.addClass(classes.failedFull)
                } else {
                    this.full = `/videos/${this.uuid}.full?timestamp=${data.full}`;
                    if (isLoad) {
                        this.loadFull();
                    }
                }
                if (data.preview) {
                    this.preview = `/videos/${this.uuid}.preview?timestamp=${data.preview}`;
                }
                // Reset share.
                this.share = 0.2;
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
        if (!this.thumb && !this.preview) {
            this.lightbox.shrink()
            return
        }
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
    loadFull(isForce = false) {
        if (!isForce) {
            if (!this.thumb && !this.preview) {
                this.lightbox.shrink()
                return
            }
            if (this.isloadingFull || !this.full
                || this.lightbox.fullVideo.getAttribute('poster') == this.full) {
                return
            }
        }
        this.isloadingFull = true

        this.lightbox.$.removeClass(classes.failedFull)
        this.lightbox.$.addClass(classes.updatingFull)
        let url = this.full
        if (isForce) {
            url = `${url}?forceLoadAt=${new Date().getTime()}`
        }
        imageAvailable(
            url,
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
        if (this.preview != this.lightbox.smallVideo.getAttribute('src')) {
            this.lightbox.smallVideo.src = this.preview
        }
    }
    loadFullPreview() {
        if (this.preview != this.lightbox.fullVideo.getAttribute('src')) {
            this.lightbox.fullVideo.src = this.preview
        }
    }
    unloadPreview() {
        this.lightbox.smallVideo.removeAttribute('src')
        this.lightbox.smallVideo.load()
        this.lightbox.fullVideo.removeAttribute('src')
        this.lightbox.fullVideo.load()
    }
    loadInfo() {
        // Skip for packed page.
        if (location.protocol == 'file:') {
            return
        }
        $.get(
            `videos/${this.uuid}.info`,
            (data: string) => {
                let detail = this.lightbox.$.find('.detail')
                detail.html(data)
                let self = this;
                (<JQuery<HTMLTableDataCellElement>>detail.find('td.notes')).click(
                    function () { self.loadNote($(this).data('taskId')) }
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
    loadNote(taskId: string) {
        // Skip for packed page.
        if (location.protocol == 'file:') {
            return
        }
        let detail = this.lightbox.$.find('.detail')
        let container = detail.find('.note-container')
        if (container.length == 0) {
            console.error('no container', this.lightbox)
            return
        }
        let template = <string | undefined>container.data('noteUrlTemplate')
        if (!template) {
            return
        }
        container.empty()
        let src = template.replace('${taskId}', taskId)
        let iframe = <JQuery<HTMLIFrameElement>>$('<iframe>', { src: src, seamless: true })

        let otherHeight = detail.height()
        let bottomHeight = this.lightbox.$.find('.viewer .bottom').outerHeight()
        bottomHeight = bottomHeight ? bottomHeight : 20
        if (otherHeight) {
            let windowHeight = window.innerHeight
            iframe.height(windowHeight - otherHeight - bottomHeight - 2)
        }

        container.append(iframe)
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