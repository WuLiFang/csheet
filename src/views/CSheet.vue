<template lang="pug">
  div.the-csheet
    TagEditToobar.select-toolbar
    PreferencePanel.control(v-show='!current')
    Lightbox(
      v-for='video in videos'
      :id='video.uuid' 
      :key='video.uuid' 
      @click="onclick" 
    )
    TheCSheetViewer(:videoId.sync='current')
</template>

<script lang="ts">
import Vue from 'vue';

import * as _ from 'lodash';

import Lightbox from '@/components/Lightbox.vue';
import TagEditToobar from '@/components/TagEditToobar.vue';
import PreferencePanel from '@/components/PreferencePanel.vue';
import StatusSelect from '@/components/StatusSelect.vue';
import TheCSheetViewer from '@/components/TheCSheetViewer.vue';
import TagSelect from '@/components/TagSelect.vue';
import {
  Button as ElButton,
  ButtonGroup as ElButtonGroup,
  Notification,
  Message,
} from 'element-ui';

import { videoComputedMinxin } from '../store/video';
import {
  VideoResponse,
  TaskStage,
  TaskStatus,
  CGTeamWorkTaskResponse,
  TagResponse,
} from '../interface';
import { CGTeamWorkTaskComputedMixin } from '@/store/cgteamwork-task';
import { tagComputedMinxin } from '@/store/tag';
import { isUndefined } from 'util';
import {
  TagUpdateActionPayload,
  VideosAddTagActionPayload,
  VIDEOS_ADD_TAG,
  FILTER_VIDEOS,
} from '@/mutation-types';
import { RootComputedMixin } from '@/store';

interface VideoSelectState {
  [id: string]: boolean | undefined;
}

export default Vue.extend({
  components: {
    Lightbox,
    TheCSheetViewer,
    StatusSelect,
    TagSelect,
    PreferencePanel,
    TagEditToobar,
  },
  data() {
    return {
      current: null as string | null,
    };
  },
  computed: {
    ...videoComputedMinxin,
    ...RootComputedMixin,
    videos(): VideoResponse[] {
      return this.videoStore.visibleVideos
        .map(i => this.videoStore.storage[i]!)
        .filter(i => i);
    },
  },
  methods: {
    onclick(video: VideoResponse) {
      this.current = video.uuid;
    },
    filterVideos() {
      this.$store.dispatch(FILTER_VIDEOS);
    },
    debouncedfilterVideos: _.debounce(function(this: any) {
      this.filterVideos();
    }, 500),
  },
  watch: {
    labelFilter() {
      this.debouncedfilterVideos();
    },
    artistFilter() {
      this.debouncedfilterVideos();
    },
    tagTextFilter() {
      this.debouncedfilterVideos();
    },
    statusFilter() {
      this.debouncedfilterVideos();
    },
  },
  mounted() {
    this.filterVideos();
  },
});
</script>

<style lang="scss" scoped>
.the-csheet {
  display: flex;
  position: relative;
  flex-wrap: wrap;
  justify-content: center;
  width: 85vw;
  margin: auto;
  .select-toolbar {
    display: flex;
    position: fixed;
    background: rgba($color: orange, $alpha: 0.5);
    width: 100%;
    height: 2em;
    text-align: center;
    justify-content: center;
    align-items: center;
    z-index: 10;
    .label {
      padding: 1em;
      color: white;
    }
  }
  .control {
    position: fixed;
    color: gray;
    right: 0;
    top: 0;
    margin: 0.5%;
    text-align: right;
  }
  &:hover {
    border-left: 1px dotted rgba(255, 255, 255, 0.3);
    border-right: 1px dotted rgba(255, 255, 255, 0.3);
  }
}
</style>

<style lang="scss">
body {
  margin: 0;
  background: black;
}
.the-csheet {
  .control {
    .filter {
      .el-input {
        width: 10em;
      }
    }
  }
}
</style>
