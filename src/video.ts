import { CSheetImage } from "./image";
import { CSheetVideoDataRow } from "./types";
import axios from 'axios';
export interface VideoStorage {
    [id: string]: CSheetVideo
}
export class CSheetVideo {
    public infoHTML = '';
    public lightboxElement = <HTMLElement | null>null;
    constructor(
        public uuid: string,
        public label: string,
        public thumb_mtime: number | null,
        public poster_mtime: number | null,
        public preview_mtime: number | null,
    ) {
    }

    public getPath(role: Role, isForce = false): string | null {
        let mtime: number | null = null;
        if (isForce) {
            mtime = new Date().getTime()
        } else {
            switch (role) {
                case Role.thumb: {
                    mtime = this.thumb_mtime
                    break
                }
                case Role.poster: {
                    mtime = this.poster_mtime
                    break
                }
                case Role.preview: {
                    mtime = this.preview_mtime
                    break
                }
                default:
                    console.error('Unkown role: ' + role)
            }
        }
        return this.getPathWithMtime(role, mtime)
    }
    getPathWithMtime(role: Role, mtime: number | null): string | null {
        if (!mtime) {
            return null
        }
        return `/videos/${this.uuid}.${role}?timestamp=${mtime}`
    }
    isAppeared(): boolean {
        if (!this.lightboxElement) {
            return false
        }
        let top = window.scrollY;
        let bottom = top + window.innerHeight;
        let ypos = this.lightboxElement.offsetTop;
        return (top <= ypos && ypos <= bottom)

    }
    static fromDataRow(data: CSheetVideoDataRow) {
        return new CSheetVideo(data[0], data[1], data[2], data[3], data[4])
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