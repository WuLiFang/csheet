import * as _ from 'lodash';
import * as io from 'socket.io-client';
import Notify from 'notifyjs';
import { Store } from 'vuex';

import { isFileProtocol } from './packtools';
import { CombinedRootState, RootState } from './store/types';
import { VideoResponse } from './interface';
import { VideoReadMutationPayload, VIDEO } from './mutation-types';

const isSupportNotify =
  typeof Notification === 'function' &&
  typeof Notification.requestPermission === 'function';
if (!isFileProtocol && isSupportNotify) {
  Notify.requestPermission();
}

export default class SocketIO {
  public socket: SocketIOClient.Socket;
  public store: Store<CombinedRootState>;
  public updateAppeared = _.throttle(() => {
    const appeared: string[] = this.store.getters.appearedVideos();
    this.requestUpdate(appeared);
  }, 2000);
  constructor(store: Store<RootState>) {
    this.store = store as Store<CombinedRootState>;
    this.socket = io(`/`, { path: '/api/socket.io' });
    this.socket.on('asset update', (message: VideoResponse[]) =>
      this.on_asset_update(message),
    );
    this.socket.on('connect', this.on_connect);
    this.socket.on('disconnect', this.on_disconnect);
    setInterval(this.updateAppeared, 2000);
  }

  public on_connect() {
    const msg = '已建立连接';
    if (isSupportNotify) {
      new Notify(msg, { timeout: 2, tag: msg }).show();
    }
  }
  public on_disconnect() {
    const msg = '连接断开';
    if (isSupportNotify) {
      new Notify(msg, { timeout: 2, tag: msg }).show();
    }
  }
  public on_asset_update(message: VideoResponse[]) {
    _.each(message, value => {
      const payload: VideoReadMutationPayload = { id: value.uuid, data: value };
      this.store.commit(VIDEO.READ, payload);
      const thumb = this.store.getters.videoURIMap.thumb[value.uuid];
      if (isSupportNotify) {
        new Notify('文件更新', {
          body: value.label,
          icon: thumb,
          timeout: 2,
          tag: value.uuid,
        }).show();
      }
    });
  }
  public requestUpdate(uuidList: string[]) {
    this.socket.emit('request update', uuidList);
  }
}
