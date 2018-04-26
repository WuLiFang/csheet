import * as $ from 'jquery';
import { Lightbox } from "./lightbox";

export class Viewer {
    private element: HTMLElement
    public readonly $: JQuery<HTMLElement>;
    constructor(
        public readonly lightbox: Lightbox) {
        this.element = lightbox.$.find('.viewer')[0]
        this.$ = $(this.element);
        let self = this;
        (<JQuery<HTMLAnchorElement>>this.$.find('a')).click(
            function () { return self.onanchorclicked(this) }
        );
        if (location.protocol != 'file:') {
            // Refresh button.
            ($(this.element).append(
                (<JQuery<HTMLButtonElement>>$('<button>', {
                    class: 'refresh',
                    click: () => { this.onrefreshclicked() },
                })))
            )
        }
    }
    onanchorclicked(anchor: HTMLAnchorElement) {
        let href = anchor.href;
        let $anchor = $(anchor);
        switch ($anchor.attr('class')) {
            case 'prev':
                let prev = this.lightbox.$.prev();
                while (prev.is('.shrink')) {
                    prev = prev.prev();
                }
                href = '#' + prev.attr('id');
                break;
            case 'next':
                let next = this.lightbox.$.next();
                while (next.is('.shrink')) {
                    next = next.next();
                }
                href = '#' + next.attr('id');
                break;
        }
        $anchor.attr('href', href);
        if (href == '#undefined') {
            return false;
        }
    }
    onrefreshclicked() {
        this.lightbox.image.unloadPreview()
        this.lightbox.image.loadThumb(true)
        this.lightbox.image.loadFull(true)
        this.lightbox.image.loadInfo()
        this.lightbox.image.loadPreview()
    }
}