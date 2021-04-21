import { RelayConnection } from '@/utils/isRelayConnection';

export default function concatRelayConnection<T extends RelayConnection>(
  a: T,
  b: T | null | undefined
): T {
  const ret = { ...a };
  if (!b) {
    return ret;
  }
  if (ret.edges) {
    ret.edges = ret.edges.concat(b.edges ?? []);
  }
  if (ret.nodes) {
    ret.nodes = ret.nodes.concat(b.nodes ?? []);
  }
  ret.pageInfo =
    a.pageInfo && b.pageInfo
      ? {
          ...a.pageInfo,
          endCursor: b.pageInfo.endCursor,
          hasNextPage: b.pageInfo.hasNextPage,
        }
      : undefined;
  return ret;
}
