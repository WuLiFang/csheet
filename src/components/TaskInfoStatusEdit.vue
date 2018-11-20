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
import Vue from 'vue';

import { Button, ButtonGroup, MessageBox, Message } from 'element-ui';

import TaskInfoStatus from '@/components/TaskInfoStatus.vue';
import {
  FieldResponse,
  TaskStatus,
  TaskStatusText,
  CGTeamWorkTaskData,
  StringMap,
} from '../interface';
import { CGTeamWorkTaskComputedMixin } from '../store/cgteamwork-task';
import {
  UPDATE_CGTEAMWORK_TASK_FIELD,
  CGTeamWorkTaskUpdateFieldActionPayload,
} from '@/mutation-types';

function errorMessage(error: any) {
  Message({ message: error.response.data, type: 'error' });
}

export default Vue.extend({
  props: {
    taskId: { type: String },
    field: { type: String as () => 'leader_status' | 'directory_status' },
  },
  components: {
    TaskInfoStatus,
    Button,
    ButtonGroup,
  },
  data() {
    return {
      TaskStatus,
    };
  },
  computed: {
    ...CGTeamWorkTaskComputedMixin,
    model(): CGTeamWorkTaskData | undefined {
      return this.cgTeamworkTaskStore.storage[this.taskId];
    },
    fieldsValue(): StringMap<TaskStatus | null> {
      return {
        leader_status: this.model ? this.model.leader_status : null,
        director_status: this.model ? this.model.director_status : null,
        client_status: this.model ? this.model.client_status : null,
      };
    },
    status(): TaskStatus | null {
      return this.fieldsValue[this.field];
    },
    hasPermission(): boolean {
      return this.model ? this.model.permissions[this.field] : false;
    },
  },
  methods: {
    approve() {
      const payload: CGTeamWorkTaskUpdateFieldActionPayload = {
        id: this.taskId,
        field: this.field,
        data: { value: 'Approve', is_status: true },
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
          const payload: CGTeamWorkTaskUpdateFieldActionPayload = {
            id: this.taskId,
            field: this.field,
            data: {
              value: 'Retake',
              is_status: true,
              message: result.value,
            },
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
