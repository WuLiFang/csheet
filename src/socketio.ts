import { VideoResponse, VideoRole } from '@/interface';
import {
  READ_VIDEO_TAGS_IF_FOUND_UNDEFINED,
  REFETCH_PAGE_DATA,
  UPDATE_VIDEO_APPEARED,
  VIDEO,
  VideoTagsReadIfFoundUndefinedActionPayload,
  VideoUpdateMutationPayload,
} from '@/mutation-types';
import { isFileProtocol } from '@/packtools';
import { CombinedRootState, RootState } from '@/store/types';
import * as _ from 'lodash';
import Notify from 'notifyjs';
import * as io from 'socket.io-client';
import { isUndefined } from 'util';
import { Store } from 'vuex';

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
      this.on_asset_update(message)
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
      if (isUndefined(this.store.state.videoStore.storage[value.uuid])) {
        return;
      }
      const actionPayload: VideoTagsReadIfFoundUndefinedActionPayload = {
        video: value,
      };
      this.store
        .dispatch(READ_VIDEO_TAGS_IF_FOUND_UNDEFINED, actionPayload)
        .then(() => {
          const mutationPayload: VideoUpdateMutationPayload = {
            id: value.uuid,
            data: value,
          };
          this.store.commit(VIDEO.UPDATE, mutationPayload);
          const thumb = this.store.getters.getVideoURI(
            value.uuid,
            VideoRole.thumb
          );
          if (isSupportNotify) {
            new Notify('文件更新', {
              body: value.label,
              icon: thumb,
              timeout: 2,
              tag: value.uuid,
            }).show();
          }
        });
    });
  }
  /**
   * onPageUpdated
   */
  public onPageUpdated(id: string) {
    if (id !== this.store.state.id) {
      return;
    }
    this.store.dispatch(REFETCH_PAGE_DATA);
  }
  public requestUpdate(uuidList: string[]) {
    if (uuidList.length > 0) {
      this.socket.emit('request update', uuidList);
    }
  }
}
