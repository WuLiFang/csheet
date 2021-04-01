import { Collection } from '@/graphql/queries/collections';
import { computed, Ref } from '@vue/composition-api';
import cast from 'cast-unknown';

const statusPriority: Record<string, number | undefined> = {
  Approve: 1,
  Wait: 2,
  Check: 3,
  Retake: 4,
  Close: 5,
};

export default function useCGTeamworkTaskStatus(
  collection: Ref<Collection | undefined>
): Ref<string> {
  return computed(() => {
    const data = collection.value?.metadata.find(
      (i) => i.k === 'cgteamwork.tasks'
    )?.v;
    let ret = '';
    if (!data) {
      return '';
    }
    for (const i of cast.array(JSON.parse(data))) {
      for (const status of Object.values(i?.status).map(cast.string)) {
        if ((statusPriority[status] ?? 0) > (statusPriority[ret] ?? 0)) {
          ret = status;
        }
      }
    }
    return ret;
  });
}
