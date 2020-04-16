declare namespace Relay {
  interface Node {
    id: string;
  }
  interface Edge<T extends Node | null> {
    node: T | null;
  }
  interface PageInfo {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  }
  interface Connection<T extends Node = Node> {
    pageInfo: PageInfo;
    nodes?: (T | null)[] | null;
    edges: (Edge<T | null> | null)[] | null;
  }
}
