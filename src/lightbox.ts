import * as $ from 'jquery';
import { CSheetImage } from './image';
import { Viewer } from './viewer';
let shrinkClass = 'shrink'

export class Lightbox {
    readonly image: CSheetImage;
    readonly $: JQuery<HTMLElement>;
    readonly smallVideo: HTMLVideoElement;
    readonly fullVideo: HTMLVideoElement;
    readonly smallImage: HTMLImageElement;
    readonly fullImage: HTMLImageElement;
    public readonly viewer: Viewer;
    public appeared = false;
    public isExpanded = false;
    public modeChangedCallbacks: ((lightbox: Lightbox) => void)[] = [];
    public videoHeight = 200;
    constructor(public element: HTMLElement) {
        this.$ = $(element);
        this.smallVideo = <HTMLVideoElement>this.$.find('video.small')[0];
        this.fullVideo = <HTMLVideoElement>this.$.find('video.full')[0];
        this.smallImage = <HTMLImageElement>this.$.find('.small img')[0];
        this.fullImage = <HTMLImageElement>this.$.find('.full img')[0];
        this.$.mouseenter(() => { this.onmouseenter() });
        element.draggable = true;
        this.$.on('dragstart', this.ondragstart);
        this.viewer = new Viewer(this)
        let lightbox = this;

        // Play control.
        this.smallVideo.addEventListener('loadeddata', function () { if (!$(location.hash).is('.lightbox')) { this.play() } })
        this.smallVideo.addEventListener('mouseenter',
            function () {
                if (this.readyState > 1) {
                    this.play();
                }
            })
        this.smallVideo.addEventListener('mouseleave', function () { this.pause() })
        this.fullVideo.addEventListener('loadedmetadata', function () { this.controls = this.duration > 0.1 })

        this.image = new CSheetImage(
            this.$.data('uuid'),
            this.$.data('thumb'),
            this.$.data('full'),
            this.$.data('preview'),
            this);
    }
    shrink() {
        let modeChanged = !this.$.is('.' + shrinkClass)
        this.$.width('10px');
        if (modeChanged) {
            this.$.addClass(shrinkClass);
            this.isExpanded = false;
            this.modeChangedCallbacks.forEach((cb) => { cb(this) })
        }
    }
    expand() {
        this.$.height(this.videoHeight);
        this.$.width(this.image.ratio * this.videoHeight);
        if (this.$.is('.' + shrinkClass)) {
            this.$.removeClass(shrinkClass);
        }
        this.isExpanded = true;
        this.modeChangedCallbacks.forEach((cb) => { cb(this) })
    }
    onmouseenter() {
        this.image.loadPreview()
    }
    ondragstart(ev: JQuery.Event) {
        let event = <DragEvent>ev.originalEvent;
        // let lightbox = getLightbox(this);
        let lightbox = this;
        let dragData = <string>$(lightbox).data('drag');
        let plainData = dragData;
        if (window.location.protocol == 'file:') {
            plainData =
                window.location.origin +
                decodeURI(
                    window.location.pathname.slice(
                        0, window.location.pathname.lastIndexOf('/'))) +
                '/' +
                plainData;
        }
        event.dataTransfer.setData('text/plain', plainData);
        event.dataTransfer
            .setData('text/uri-list',
                window.location.origin +
                window.location.pathname +
                window.location.search +
                '#' +
                this.element.id);
    }
    ondisappear() {
        this.image.unloadPreview()
    }
    onappear() {
        this.image.loadFull()
        this.image.update()
    }
}

export class LightboxManager {
    private readonly count = $('#count');
    private dict: { [uuid: string]: Lightbox };
    private array: Lightbox[];
    constructor() {
        this.dict = {};
        this.array = []
        $('.lightbox').toArray().map((element: HTMLElement) => {
            let lightbox = new Lightbox(element);
            this.array.push(lightbox);
            lightbox.image.loadThumb();
            lightbox.modeChangedCallbacks.push(() => { this.updateCount() })
            this.dict[lightbox.image.uuid] = lightbox
        })
        window.addEventListener('hashchange', (ev) => { this.onhashchange(ev) })
        $('html').dblclick(() => { this.onpagedbclick() });
    }
    getAppeared() {
        let $window = $(window)
        let top = <number>$window.scrollTop();
        let bottom = top + <number>$window.height();
        return this.array.filter(
            (lightbox) => {
                let coord = lightbox.$.offset()
                if (!coord) {
                    return false
                }
                let ypos = coord.top
                let result = ypos >= top && ypos < bottom;
                if (lightbox.appeared != result) {
                    if (result) {
                        lightbox.onappear()
                    } else {
                        lightbox.ondisappear()
                    }
                }
                lightbox.appeared = result;
                return result;
            }
        )
    }
    updateAppeared() {
        this.getAppeared().forEach((lightbox) => {

            if (!lightbox.smallVideo.poster) {
                lightbox.image.loadThumb()
            }
            lightbox.image.update()
        })
    }
    updateCount() {
        let total = this.array.length;
        let expaneded = this.array.filter((lightbox) => { return lightbox.isExpanded }).length
        this.count.html(`${expaneded}/${total}`)
    }
    onhashchange(ev: HashChangeEvent) {
        if (ev.oldURL) {
            let $old = $(new URL(ev.oldURL).hash)
            if ($old.is('.lightbox')) {
                let lightbox = this.dict[$old.data('uuid')]
                lightbox.image.unloadPreview()
            }
        }
        if (ev.newURL) {
            let $new = $(new URL(ev.newURL).hash)
            if ($new.is('.lightbox')) {
                let lightbox = this.dict[$new.data('uuid')]
                this.array.map((lightbox) => { lightbox.smallVideo.pause() })
                lightbox.image.loadFull()
                lightbox.image.loadFullPreview()
                lightbox.image.loadInfo()
            }
        }
    }
    onpagedbclick() {
        this.getAppeared().forEach(
            (lighbox) => {
                if (!lighbox.smallVideo.readyState) {
                    lighbox.image.loadPreview();
                } else {
                    lighbox.smallVideo.play();
                }
            }
        );
    }
}