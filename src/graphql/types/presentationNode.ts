/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: presentationNode
// ====================================================

export interface presentationNode_node_Collection {
  __typename: "Collection";
}

export interface presentationNode_node_Presentation_raw {
  __typename: "DiskFile";
  path: string;
  modTime: any | null;
  size: number | null;
}

export interface presentationNode_node_Presentation_thumb {
  __typename: "WebFile";
  url: string;
}

export interface presentationNode_node_Presentation_regular {
  __typename: "WebFile";
  url: string;
}

export interface presentationNode_node_Presentation_metadata {
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

export interface presentationNode_node_Presentation {
  __typename: "Presentation";
  id: string;
  type: string;
  raw: presentationNode_node_Presentation_raw;
  thumb: presentationNode_node_Presentation_thumb | null;
  isThumbTranscodeFailed: boolean | null;
  regular: presentationNode_node_Presentation_regular | null;
  isRegularOutdated: boolean | null;
  isRegularTranscodeFailed: boolean | null;
  metadata: presentationNode_node_Presentation_metadata[];
}

export type presentationNode_node = presentationNode_node_Collection | presentationNode_node_Presentation;

export interface presentationNode {
  node: presentationNode_node | null;
}

export interface presentationNodeVariables {
  id: string;
  filePathFormat?: string | null;
}
