<template lang="pug">
  div.the-csheet
    TagEditToobar.select-toolbar
    FadeTransition
      PreferencePanel.control(v-show='!isViewerVisible')
    Lightbox(
      v-for='video in videos'
      :id='video.uuid'
      :key='video.uuid'
      @click="onclick"
    )
    TheViewer(:videoId.sync='current' :visible.sync='isViewerVisible')
</template>

<script lang="ts">
import { FILTER_VIDEOS } from '@/mutation-types';
import { RootComputedMixin } from '@/store';
import { videoComputedMixin } from '@/store/video';
import * as _ from 'lodash';
import Vue from 'vue';

import { default as FadeTransition } from '@/components/FadeTransition.vue';
import { default as Lightbox } from '@/components/Lightbox.vue';
import { default as PreferencePanel } from '@/components/PreferencePanel.vue';
import { default as StatusSelect } from '@/components/StatusSelect.vue';
import { default as TagEditToobar } from '@/components/TagEditToobar.vue';
import { default as TagSelect } from '@/components/TagSelect.vue';
import { default as TheViewer } from '@/components/TheViewer.vue';

import { IVideoResponse } from '@/interface';

export default Vue.extend({
  components: {
    FadeTransition,
    Lightbox,
    PreferencePanel,
    StatusSelect,
    TagEditToobar,
    TagSelect,
    TheViewer,
  },
  data() {
    return {
      current: null as string | null,
      isViewerVisible: false,
    };
  },
  computed: {
    ...videoComputedMixin,
    ...RootComputedMixin,
    videos(): IVideoResponse[] {
      return this.videoStore.visibleVideos
        .map(i => this.videoStore.storage[i]!)
        .filter(i => i);
    },
  },
  methods: {
    onclick(video: IVideoResponse) {
      this.current = video.uuid;
      this.isViewerVisible = true;
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
