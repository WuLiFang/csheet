import * as _ from 'lodash';
import * as io from 'socket.io-client';
import Notify from 'notifyjs';
import { Store } from 'vuex';

import { isFileProtocol } from './packtools';
import { CombinedRootState, RootState } from './store/types';
import { VideoResponse, VideoRole } from './interface';
import {
  VideoReadMutationPayload,
  VIDEO,
  VideoPreloadActionPayload,
  PRELOAD_VIDEO,
  CLEAR_VIDEO_BLOB,
  VideoClearBlobMutationPayload,
  VideoUpdateBlobWhiteListMapMutationPayload,
  UPDATE_VIDEO_BLOB_WHITELIST,
  UPDATE_VIDEO_APPEARED,
} from './mutation-types';
import { WSAVERNOTSUPPORTED } from 'constants';

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
    this.store.dispatch(UPDATE_VIDEO_APPEARED);
    const appeared: string[] =
      this.store.state.videoStore.blobWhiteListMap.get('appeared') || [];
    this.requestUpdate(appeared);
  }, 5000);
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
      if (!this.store.state.videoStore.storage[value.uuid]) {
        return;
      }
      const payload: VideoReadMutationPayload = { id: value.uuid, data: value };
      this.store.commit(VIDEO.READ, payload);
      const thumb = this.store.getters.getVideoURI(value.uuid, VideoRole.thumb);
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
