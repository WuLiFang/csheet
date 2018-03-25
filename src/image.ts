import * as $ from 'jquery';
import { Lightbox } from './lightbox';

enum classes {
    failedThumb = 'failed-thumb',
    failedFull = 'failed-full',
    updatingThumb = 'updating-thumb',
    updatingFull = 'updating-full',
}
export class CSheetImage {
    public ratio = 1;
    private isUpdating = false;
    private isloadingThumb = false;
    private isloadingFull = false;

    constructor(
        readonly uuid: string,
        public thumb: string,
        public full: string,
        public preview: string,
        public readonly lightbox: Lightbox,
    ) {
    }
    update() {
        if (this.isUpdating) {
            return
        }
        this.lightbox.$.addClass(classes.updatingFull)
        this.lightbox.$.addClass(classes.updatingThumb)
        $.get(
            '/api/image/url',
            { uuid: this.uuid },
            (data: ImageData) => {
                if (!data.thumb) {
                    this.onthumberror()
                } else if (data.thumb == this.thumb) {
                    this.lightbox.$.removeClass(classes.updatingThumb)
                    this.lightbox.$.removeClass(classes.failedThumb)
                } else {
                    this.thumb = data.thumb;
                    this.loadThumb();

                }
                if (!data.full) {
                    this.lightbox.$.addClass(classes.failedFull)
                } else if (data.full == this.full) {
                    this.lightbox.$.removeClass(classes.updatingFull)
                    this.lightbox.$.removeClass(classes.failedFull)
                } else {
                    this.full = data.full;
                    this.loadFull();
                }
                this.preview = data.preview;
                this.isUpdating = false
            }
        );
    }
    loadThumb() {
        if (this.isloadingThumb || !this.thumb) {
            return
        }
        this.isloadingThumb = true
        this.lightbox.$.removeClass(classes.failedThumb)
        imageAvailable(
            this.thumb,
            (img) => {
                this.ratio = img.width / img.height;
                this.lightbox.smallImage.src = img.src
                this.lightbox.smallVideo.poster = img.src
                this.lightbox.$.removeClass(classes.updatingThumb)
                this.lightbox.expand()
                this.isloadingThumb = false
            },
            () => {

                this.lightbox.$.addClass(classes.failedThumb)
                this.onthumberror()
                this.isloadingThumb = false
            }
        )
    }

    loadFull() {
        if (this.isloadingFull || !this.full) {
            return
        }
        this.isloadingFull = true

        this.lightbox.$.removeClass(classes.failedFull)
        imageAvailable(
            this.full,
            (img) => {
                this.lightbox.fullImage.src = img.src
                this.lightbox.fullVideo.poster = img.src
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
        if (!this.preview) {
            return
        }
        this.lightbox.smallVideo.src = this.preview
        this.lightbox.fullVideo.src = this.preview
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
        if (!(this.lightbox.smallVideo.poster
            || this.lightbox.smallImage.src)
        ) {
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
    thumb: string
    full: string
    preview: string
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
    onerror = () => { }
) {
    let temp = new Image;
    temp.onload = () => { onload(temp); };
    temp.onerror = onerror;
    temp.src = url;
}