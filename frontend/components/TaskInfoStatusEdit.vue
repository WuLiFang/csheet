<template lang="pug">
  span.task-info-edit(v-if='model')
    TaskInfoStatus(:status='status')
      template(slot-scope='childStatus')
        slot(:text='childStatus.text')
          | {{childStatus.text}}
    span.edit(v-show='hasPermission')
      Button.el-icon-check(v-show='status != TaskStatus.Approve' plain size='mini' type='success' @click='approve')
      Button.el-icon-close(plain size='mini' type='danger' @click='retake')
</template>

<script lang="ts">
import { ICGTeamWorkTaskResponse, IStringMap, TaskStatus } from '@/interface';
import {
  ICGTeamWorkTaskUpdateFieldActionPayload,
  UPDATE_CGTEAMWORK_TASK_FIELD,
} from '@/mutation-types';
import { CGTeamWorkTaskComputedMixin } from '@/store/cgteamwork-task';
import Vue from 'vue';

import { default as TaskInfoStatus } from '@/components/TaskInfoStatus.vue';
import { Button, ButtonGroup, Message, MessageBox } from 'element-ui';

import { parseTaskStatus } from '@/datatools';

function errorMessage(error: any) {
  Message({ message: error.response.data, type: 'error' });
}

export default Vue.extend({
  components: {
    Button,
    ButtonGroup,
    TaskInfoStatus,
  },
  props: {
    field: { type: String as () => 'leader_status' | 'director_status' },
    taskId: { type: String },
  },
  data() {
    return {
      TaskStatus,
    };
  },

  computed: {
    ...CGTeamWorkTaskComputedMixin,
    model(): ICGTeamWorkTaskResponse | undefined {
      return this.cgTeamworkTaskStore.storage[this.taskId];
    },
    fieldsValue(): IStringMap<TaskStatus | null> {
      return {
        client_status: this.model
          ? parseTaskStatus(this.model.client_status)
          : null,
        director_status: this.model
          ? parseTaskStatus(this.model.director_status)
          : null,
        leader_status: this.model
          ? parseTaskStatus(this.model.leader_status)
          : null,
      };
    },
    status(): TaskStatus | null {
      return this.fieldsValue[this.field] || null;
    },
    hasPermission(): boolean {
      return (
        (this.model &&
          this.model.permissions &&
          this.model.permissions[this.field]) ||
        false
      );
    },
  },
  methods: {
    approve() {
      const payload: ICGTeamWorkTaskUpdateFieldActionPayload = {
        data: { value: 'Approve', is_status: true },
        field: this.field,
        id: this.taskId,
      };
      this.$store
        .dispatch(UPDATE_CGTEAMWORK_TASK_FIELD, payload)
        .then(() => {
          Message({ message: '镜头设为通过', type: 'success' });
        })
        .catch(errorMessage);
    },
    retake() {
      MessageBox.prompt('原因', '设为返修')
        .then((result: any) => {
          const payload: ICGTeamWorkTaskUpdateFieldActionPayload = {
            data: {
              is_status: true,
              message: result.value,
              value: 'Retake',
            },
            field: this.field,
            id: this.taskId,
          };
          this.$store
            .dispatch(UPDATE_CGTEAMWORK_TASK_FIELD, payload)
            .then(() => {
              Message({ message: '镜头设为返修', type: 'success' });
            })
            .catch(errorMessage);
        })
        .catch(reason => {
          Message({ message: '取消操作' });
        });
    },
  },
});
</script>

<style lang="scss" scoped>
.task-info-edit {
  display: flex;
  align-items: center;
  .edit {
    margin: 0em;

    .el-button {
      margin: 0.1em;
    }
  }
}
</style>
