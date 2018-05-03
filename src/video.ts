import { CSheetImage, imageAvailable } from "./image";
import { CSheetVideoDataRow } from "./types";
import axios from 'axios';
import { isFileProtocol } from "./packtools";
export interface VideoStorage {
    [id: string]: CSheetVideo
}
export class CSheetVideo {
    public infoHTML = '';
    public lightboxElement = <HTMLElement | null>null;
    public isVisible = false;
    public isRecentlyAppreared = false;
    public posterReady = false;
    public posterFailed = false;
    constructor(
        public uuid: string,
        public label: string,
        public thumb_mtime: number | null,
        public poster_mtime: number | null,
        public preview_mtime: number | null,
        public src: string | null,
        public poster: string | null,
    ) {
    }
    public getPackedPath(role: Role): string | null {
        if (!this.getMtime(role)) {
            return null
        }
        let folder: string
        let suffix: string
        switch (role) {
            case Role.thumb: {
                folder = 'thumbs'
                suffix = '.jpg'
                break
            }
            case Role.poster: {
                folder = 'images'
                suffix = '.jpg'
                break
            }
            case Role.preview: {
                folder = 'previews'
                suffix = '.mp4'
                break
            }
            default: {
                return null
            }
        }
        return `${folder}/${this.label}${suffix}`
    }
    public getMtime(role: Role): number | null {
        switch (role) {
            case Role.thumb: {
                return this.thumb_mtime
            }
            case Role.poster: {
                return this.poster_mtime
            }
            case Role.preview: {
                return this.preview_mtime
            }
            default:
                console.error('Unkown role: ' + role)
                return null
        }
    }
    public getPath(role: Role): string | null {
        if (isFileProtocol) {
            return this.getPackedPath(role)
        }
        let mtime = this.getMtime(role)
        return this.getPathWithMtime(role, mtime)
    }
    getPathWithMtime(role: Role, mtime: number | null): string | null {
        if (!mtime) {
            return null
        }
        return `/videos/${this.uuid}.${role}?timestamp=${mtime}`
    }
    isAppeared(): boolean {
        if (!this.lightboxElement || !this.isVisible) {
            return false
        }
        let top = window.scrollY;
        let bottom = top + window.innerHeight;
        let ypos = this.lightboxElement.offsetTop;
        let boxHeight = this.lightboxElement.clientHeight;
        let ret = (top <= ypos + boxHeight && ypos <= bottom)
        this.isRecentlyAppreared = ret;
        return ret

    }
    loadPoster() {
        if (this.posterReady) {
            return
        }
        let uri = this.getPath(Role.poster)
        this.posterFailed = false
        if (!uri) {
            return
        }
        imageAvailable(
            uri,
            () => { this.posterReady = true },
            () => { this.posterFailed = true }
        )
    }
    scrollToThis() {
        let element = this.lightboxElement
        if (element) {
            window.scroll(undefined, element.offsetTop)
        }
    }
    static fromDataRow(data: CSheetVideoDataRow) {
        return new CSheetVideo(data[0], data[1], data[2], data[3], data[4], data[5], data[6])
    }
    async loadInfo() {
        // Skip for packed page.
        if (location.protocol == 'file:') {
            return
        }
        return axios.get(
            `videos/${this.uuid}.info`,
        ).then(
            response => { this.infoHTML = response.data }
        );
    }
}
export enum Role {
    thumb = 'thumb',
    poster = 'poster',
    preview = 'preview',

}