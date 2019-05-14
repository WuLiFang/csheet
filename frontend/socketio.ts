import { PAGE_ID } from '@/constants';
import { IVideoResponse, VideoRole } from '@/interface';
import {
  READ_VIDEO_TAGS_IF_FOUND_UNDEFINED,
  REFETCH_PAGE_DATA,
  UPDATE_VIDEO_APPEARED,
  VIDEO,
  VideoTagsReadIfFoundUndefinedActionPayload,
  VideoUpdateMutationPayload,
} from '@/mutation-types';
import { isFileProtocol } from '@/packtools';
import { ICombinedIRootState, IRootState } from '@/store/types';
import * as _ from 'lodash';
import Notify from 'notifyjs';
import * as io from 'socket.io-client';
import { Store } from 'vuex';

const isSupportNotify =
  typeof Notification === 'function' &&
  typeof Notification.requestPermission === 'function';
if (!isFileProtocol && isSupportNotify) {
  Notify.requestPermission();
}

export class SocketIO {
  public socket: SocketIOClient.Socket;
  public store: Store<ICombinedIRootState>;
  public updateAppeared = _.throttle(() => {
    this.store.dispatch(UPDATE_VIDEO_APPEARED);
    const appeared: string[] =
      this.store.state.videoStore.blobWhiteListMap.get('appeared') || [];
    this.requestUpdate(appeared);
  }, 5000);
  constructor(store: Store<IRootState>) {
    this.store = store as Store<ICombinedIRootState>;
    this.socket = io(`/`, { path: '/api/socket.io' });
    this.socket.on('asset update', this.onAssetUpdate.bind(this));
    this.socket.on('connect', this.onConnect.bind(this));
    this.socket.on('disconnect', this.onDisconnect.bind(this));
    this.socket.on('page update', this.onPageUpdated.bind(this));
    setInterval(this.updateAppeared.bind(this), 2000);
  }

  public onConnect() {
    const msg = '已建立连接';
    if (isSupportNotify) {
      new Notify(msg, { timeout: 2, tag: msg }).show();
    }
  }
  public onDisconnect() {
    const msg = '连接断开';
    if (isSupportNotify) {
      new Notify(msg, { timeout: 2, tag: msg }).show();
    }
  }
  public onAssetUpdate(message: IVideoResponse[]) {
    if (!(message instanceof Array)) {
      throw new Error(`Wrong message type: ${JSON.stringify(message)}`);
    }
    message.forEach(value => {
      if (!(value.uuid in this.store.state.videoStore.storage)) {
        return;
      }
      const actionPayload: VideoTagsReadIfFoundUndefinedActionPayload = {
        video: value,
      };
      this.store
        .dispatch(READ_VIDEO_TAGS_IF_FOUND_UNDEFINED, actionPayload)
        .then(() => {
          const mutationPayload: VideoUpdateMutationPayload = {
            data: value,
            id: value.uuid,
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
              tag: value.uuid,
              timeout: 2,
            }).show();
          }
        });
    });
  }
  /**
   * onPageUpdated
   */
  public onPageUpdated(id: string) {
    if (id !== PAGE_ID) {
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

export default SocketIO;
