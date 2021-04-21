import { PageInfo } from '@/utils/isPageInfo';
import isRelayConnection, { RelayConnection } from '@/utils/isRelayConnection';
import concatRelayConnection from '@/utils/concatRelayConnection';
import { ObservableQuery } from 'apollo-client';

export default async function fetchMore<
  K extends keyof T,
  T extends { [P in K]: RelayConnection },
  V extends {
    first?: number | null;
    after?: string | null;
  }
>(
  query: Pick<ObservableQuery<T, V>, 'fetchMore'>,
  pageInfo: PageInfo,
  size = 20
): Promise<void> {
  if (!pageInfo.hasNextPage) {
    return;
  }
  try {
    await query.fetchMore({
      variables: {
        after: pageInfo.endCursor,
        first: size,
      },
      updateQuery(previousResult, { fetchMoreResult }) {
        if (!fetchMoreResult) {
          return previousResult;
        }
        return Object.fromEntries(
          Object.entries(previousResult).map(([k, v]) =>
            isRelayConnection(v)
              ? [k, concatRelayConnection(v, fetchMoreResult[k as K])]
              : [k, v]
          )
        ) as T;
      },
    });
  } catch (err) {
    // https://github.com/apollographql/apollo-client/issues/4114
    if (String(err).startsWith('Invariant Violation:')) {
      // pass
    } else {
      throw err;
    }
  }
}
