/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: collections
// ====================================================

export interface collections_collections_nodes_metadata {
  __typename: "StringEntry";
  /**
   * key
   */
  k: string;
  /**
   * value
   */
  v: string;
}

export interface collections_collections_nodes_presentations_raw {
  __typename: "File";
  path: string;
  modTime: any | null;
  size: number | null;
}

export interface collections_collections_nodes_presentations_thumb {
  __typename: "File";
  path: string;
  modTime: any | null;
  size: number | null;
}

export interface collections_collections_nodes_presentations_regular {
  __typename: "File";
  path: string;
  modTime: any | null;
  size: number | null;
}

export interface collections_collections_nodes_presentations {
  __typename: "Presentation";
  id: string;
  type: string;
  raw: collections_collections_nodes_presentations_raw;
  thumb: collections_collections_nodes_presentations_thumb | null;
  regular: collections_collections_nodes_presentations_regular | null;
  isRegularOutdated: boolean | null;
  isRegularTranscodeFailed: boolean | null;
}

export interface collections_collections_nodes {
  __typename: "Collection";
  id: string;
  title: string;
  origin: string;
  metadata: collections_collections_nodes_metadata[];
  presentations: collections_collections_nodes_presentations[];
  collectTime: any;
}

export interface collections_collections_pageInfo {
  __typename: "PageInfo";
  startCursor: string | null;
  endCursor: string | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface collections_collections {
  __typename: "CollectionConnection";
  nodes: (collections_collections_nodes | null)[] | null;
  pageInfo: collections_collections_pageInfo;
}

export interface collections {
  collections: collections_collections;
}

export interface collectionsVariables {
  after?: string | null;
  before?: string | null;
  first?: number | null;
  last?: number | null;
  originPrefix?: string | null;
  filePathFormat?: string | null;
  presentationCountGt?: number | null;
}
