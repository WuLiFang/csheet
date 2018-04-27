import * as io from 'socket.io-client';
import Notify from 'notifyjs';
import { LightboxManager } from './lightbox';
import * as _ from 'lodash';

export default class SocketIO {
    public socket: SocketIOClient.Socket
    constructor(public manager: LightboxManager) {
        this.socket = io(`/`, { path: '/api/socket.io' })
        Notify.requestPermission()
        this.socket.on('asset update', (message: (string | number | null)[][]) => this.on_asset_update(message))
        this.socket.on('connect', this.on_connect)
        this.socket.on('disconnect', this.on_disconnect)
        setInterval(this.updateAppeared, 2000)
    }
    on_connect() {
        new Notify('已建立连接').show()
    }
    on_disconnect() {
        new Notify('连接断开').show()
    }
    on_asset_update(message: (string | number | null)[][]) {
        let manager = this.manager;
        _.each(message,
            value => {
                let uuid = <string>value[0]
                let thumb_mtime = <number | null>value[1]
                let poster_mtime = <number | null>value[2]
                let preview_mtime = <number | null>value[3]
                let label = <string | null>value[4]
                if (manager.updateAsset(uuid, thumb_mtime, poster_mtime, preview_mtime)) {
                    new Notify('文件更新', { body: label ? label : '<未命名>' }).show()
                }
            }
        )

    }
    requestUpdate(uuidList: string[]) {
        this.socket.emit(
            'request update', uuidList
        )
    }
    updateAppeared = _.throttle(() => {
        let appread = this.manager.getAppeared()
        let uuidList = appread.map(value => value.image.uuid)
        this.requestUpdate(uuidList)
    }, 2000)
}
interface UpdatedAssets {

}
interface UpdatedAsset {

}