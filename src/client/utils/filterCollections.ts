import { Collection } from '@/graphql/types/Collection';
import { collectionsVariables } from '@/graphql/types/collections';

export default function filterCollections(
  collections: Collection[],
  variables: collectionsVariables
): Collection[] {
  return collections.filter((i) => {
    if (
      variables.presentationCountGt != null &&
      i.presentations.length <= variables.presentationCountGt
    ) {
      return false;
    }
    if (variables.tagOr && !variables.tagOr.some((j) => i.tags.includes(j))) {
      return false;
    }
    if (
      variables.tagAnd &&
      !variables.tagAnd.every((j) => i.tags.includes(j))
    ) {
      return false;
    }
    return true;
  });
}
