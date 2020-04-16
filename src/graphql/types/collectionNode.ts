/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: collectionNode
// ====================================================

export interface collectionNode_node_Presentation {
  __typename: "Presentation" | "CollectedEvent";
}

export interface collectionNode_node_Collection_metadata {
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

export interface collectionNode_node_Collection_presentations_raw {
  __typename: "File";
  path: string;
  modTime: any | null;
  size: number;
}

export interface collectionNode_node_Collection_presentations_thumb {
  __typename: "File";
  path: string;
  modTime: any | null;
  size: number;
}

export interface collectionNode_node_Collection_presentations_regular {
  __typename: "File";
  path: string;
  modTime: any | null;
  size: number;
}

export interface collectionNode_node_Collection_presentations {
  __typename: "Presentation";
  id: string;
  type: string;
  raw: collectionNode_node_Collection_presentations_raw;
  thumb: collectionNode_node_Collection_presentations_thumb | null;
  regular: collectionNode_node_Collection_presentations_regular | null;
  isRegularOutdated: boolean | null;
}

export interface collectionNode_node_Collection {
  __typename: "Collection";
  id: string;
  title: string;
  origin: string;
  metadata: collectionNode_node_Collection_metadata[];
  presentations: collectionNode_node_Collection_presentations[];
  collectTime: any;
}

export type collectionNode_node = collectionNode_node_Presentation | collectionNode_node_Collection;

export interface collectionNode {
  node: collectionNode_node | null;
}

export interface collectionNodeVariables {
  id: string;
  filePathFormat?: string | null;
}
