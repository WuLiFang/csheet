import { RelayConnection } from '@/utils/isRelayConnection';

export type NodeType<T> = T extends RelayConnection<infer V> ? V : never;

/**
 * Extract array from relay like connection.
 * @param  connection Relay like connection data.
 * @return  Extracted nodes
 */
export default function extractNodes<T>(
  connection:
    | Partial<{
        nodes?: (T | null)[] | null;
        edges?:
          | ({
              node: T | null;
              cursor?: string;
            } | null)[]
          | null;
      }>
    | null
    | undefined
): T[] {
  if (!connection) {
    return [];
  }
  const nodes: T[] = [];
  for (const i of connection.nodes ||
    (connection.edges || []).map(i => i && i.node) ||
    []) {
    if (i) {
      nodes.push(i);
    }
  }
  return nodes;
}
