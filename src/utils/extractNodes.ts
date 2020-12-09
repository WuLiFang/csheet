import { RelayConnection } from '@/utils/isRelayConnection';
import { RelayNode } from '@/utils/isRelayNode';

export type NodeType<T> = T extends RelayConnection<infer V> ? V : never;

/**
 * Extract array from relay connection.
 * @param  connection Relay connection data.
 * @return  Extracted nodes
 */
export default function extractNodes<T extends RelayNode>(
  connection: Partial<RelayConnection<T>> | null | undefined
): T[] {
  if (!connection) {
    return [];
  }
  const nodes: T[] = [];
  for (const i of connection.nodes ||
    (connection.edges || []).map((i) => i && i.node) ||
    []) {
    if (i) {
      nodes.push(i);
    }
  }
  return nodes;
}
