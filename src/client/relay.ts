/**
 * Extract array from relay connection.
 * @param  connection Relay connection data.
 * @return  Extracted nodes
 */
export function extractNodes<T extends Relay.Node>(
  connection: Partial<Relay.Connection<T>> | null | undefined
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
export function extractPageInfo<T extends Relay.Node>(
  connection: Partial<Relay.Connection<T>> | null | undefined
): Relay.PageInfo {
  return (
    connection?.pageInfo ?? {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    }
  );
}
