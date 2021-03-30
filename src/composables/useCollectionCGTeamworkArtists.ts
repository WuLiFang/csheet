import { Collection } from '@/graphql/queries/collections';
import { computed, Ref } from '@vue/composition-api';
import cast from 'cast-unknown';

export default function useCollectionCGTeamworkArtists(
  collection: Ref<Collection>
): Ref<string[]> {
  return computed((): string[] => {
    const pipeline = collection.value.metadata.find(
      (i) => i.k === 'cgteamwork.pipeline'
    )?.v;
    if (!pipeline) {
      return [];
    }
    for (const { k, v } of collection.value.metadata ?? []) {
      switch (k) {
        case 'cgteamwork.tasks':
          return cast
            .array(JSON.parse(v))
            .map(cast.object)
            .filter((i) => cast.string(i.pipeline) === pipeline)
            .flatMap((i) => cast.array(i.artists).map(cast.string));
      }
    }
    return [];
  });
}
