import * as io from 'socket.io-client';
import Notify from 'notifyjs';
import { LightboxManager } from './lightbox';
import * as _ from 'lodash';
import { VideoStorage, CSheetVideo, Role } from './video';
import { CSheetVideoDataRow } from './types';
import { isFileProtocol } from './packtools';

export default class SocketIO {
    public socket: SocketIOClient.Socket
    constructor(public videoBus: VideoStorage) {
        this.socket = io(`/`, { path: '/api/socket.io' })
        if (!isFileProtocol) {
            Notify.requestPermission()
        }
        this.socket.on('asset update', (message: Array<CSheetVideoDataRow>) => this.on_asset_update(message))
        this.socket.on('connect', this.on_connect)
        this.socket.on('disconnect', this.on_disconnect)
        setInterval(this.updateAppeared, 2000)
    }
    on_connect() {
        let msg = '已建立连接'
        new Notify(msg, { timeout: 2, tag: msg }).show()
    }
    on_disconnect() {
        let msg = '连接断开'
        new Notify(msg, { timeout: 2, tag: msg }).show()
    }
    on_asset_update(message: Array<CSheetVideoDataRow>) {
        _.each(message,
            value => {
                let video = CSheetVideo.fromDataRow(value)
                this.videoBus[video.uuid] = video
                let thumb = video.getPath(Role.thumb)
                new Notify('文件更新',
                    {
                        body: video.label,
                        icon: thumb ? thumb : undefined,
                        timeout: 2,
                        tag: video.uuid
                    }).show()
            }
        )

    }
    requestUpdate(uuidList: string[]) {
        this.socket.emit(
            'request update', uuidList
        )
    }
    updateAppeared = _.throttle(() => {
        let appeared = _.filter(this.videoBus, value => value.isAppeared())
        let uuids = _.map(appeared, value => value.uuid)
        this.requestUpdate(uuids)
    }, 2000)
}
