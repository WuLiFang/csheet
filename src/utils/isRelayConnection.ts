import isUnion from '@/utils/isUnion';
import isPageInfo, { PageInfo } from '@/utils/isPageInfo';
import isRelayNode, { RelayNode } from '@/utils/isRelayNode';
import isUndefined from '@/utils/isUndefined';
import isNull from '@/utils/isNull';
import isRelayEdge, { RelayEdge } from '@/utils/isRelayEdge';
import { isNumber } from 'lodash';

export interface RelayConnection<T extends RelayNode = RelayNode> {
  pageInfo?: PageInfo;
  nodes?: (T | null)[] | null;
  edges?: (RelayEdge<T> | null)[] | null;
  totalCount?: number;
}

/** check if value is github style relay connection. */
export default function isRelayConnection(v: unknown): v is RelayConnection {
  try {
    return (
      isUnion((v as { pageInfo: unknown }).pageInfo, isPageInfo, isUndefined) &&
      isUnion(
        (v as { nodes: unknown }).nodes,
        (i): i is (RelayNode | null)[] =>
          Array.isArray(i) && i.every((j) => isUnion(j, isRelayNode, isNull)),
        isNull,
        isUndefined
      ) &&
      isUnion(
        (v as { edges: unknown }).edges,
        (i): i is (RelayEdge | null)[] =>
          Array.isArray(i) && i.every((j) => isUnion(j, isRelayEdge, isNull)),
        isNull,
        isUndefined
      ) &&
      isUnion((v as { totalCount: unknown }).totalCount, isNumber, isUndefined)
    );
  } catch {
    return false;
  }
}
