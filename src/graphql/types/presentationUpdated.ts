/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: presentationUpdated
// ====================================================

export interface presentationUpdated_presentationUpdated_raw {
  __typename: "DiskFile";
  path: string;
  modTime: any | null;
  size: number | null;
}

export interface presentationUpdated_presentationUpdated_thumb {
  __typename: "WebFile";
  url: string;
}

export interface presentationUpdated_presentationUpdated_regular {
  __typename: "WebFile";
  url: string;
}

export interface presentationUpdated_presentationUpdated_metadata {
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

export interface presentationUpdated_presentationUpdated {
  __typename: "Presentation";
  id: string;
  type: string;
  raw: presentationUpdated_presentationUpdated_raw;
  thumb: presentationUpdated_presentationUpdated_thumb | null;
  isThumbTranscodeFailed: boolean | null;
  regular: presentationUpdated_presentationUpdated_regular | null;
  isRegularOutdated: boolean | null;
  isRegularTranscodeFailed: boolean | null;
  metadata: presentationUpdated_presentationUpdated_metadata[];
}

export interface presentationUpdated {
  presentationUpdated: presentationUpdated_presentationUpdated;
}

export interface presentationUpdatedVariables {
  id: string[];
  filePathFormat?: string | null;
}
