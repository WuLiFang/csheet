import { collection as Collection } from '@/graphql/types/collection';
import cast from 'cast-unknown';

export default function getCollectionPipelines(
  collection: Collection | undefined
): string[] {
  try {
    return cast
      .array(
        JSON.parse(
          collection?.metadata.find(i => i.k === 'cgteamwork.tasks')?.v ?? ''
        )
      )
      .map(cast.object)
      .map(i => cast.string(i.pipeline));
  } catch {
    return [];
  }
}
