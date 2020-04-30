/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: presentationNode
// ====================================================

export interface presentationNode_node_Collection {
  __typename: "Collection" | "CollectedEvent";
}

export interface presentationNode_node_Presentation_raw {
  __typename: "File";
  path: string;
  modTime: any | null;
  size: number | null;
}

export interface presentationNode_node_Presentation_thumb {
  __typename: "File";
  path: string;
}

export interface presentationNode_node_Presentation_regular {
  __typename: "File";
  path: string;
}

export interface presentationNode_node_Presentation {
  __typename: "Presentation";
  id: string;
  type: string;
  raw: presentationNode_node_Presentation_raw;
  thumb: presentationNode_node_Presentation_thumb | null;
  regular: presentationNode_node_Presentation_regular | null;
  isRegularOutdated: boolean | null;
  isRegularTranscodeFailed: boolean | null;
}

export type presentationNode_node = presentationNode_node_Collection | presentationNode_node_Presentation;

export interface presentationNode {
  node: presentationNode_node | null;
}

export interface presentationNodeVariables {
  id: string;
  filePathFormat?: string | null;
}
