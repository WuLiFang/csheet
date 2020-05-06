/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: collection
// ====================================================

export interface collection_metadata {
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

export interface collection_presentations_raw {
  __typename: "DiskFile";
  path: string;
  modTime: any | null;
  size: number | null;
}

export interface collection_presentations_thumb {
  __typename: "WebFile";
  url: string;
}

export interface collection_presentations_regular {
  __typename: "WebFile";
  url: string;
}

export interface collection_presentations {
  __typename: "Presentation";
  id: string;
  type: string;
  raw: collection_presentations_raw;
  thumb: collection_presentations_thumb | null;
  isThumbTranscodeFailed: boolean | null;
  regular: collection_presentations_regular | null;
  isRegularOutdated: boolean | null;
  isRegularTranscodeFailed: boolean | null;
}

export interface collection {
  __typename: "Collection";
  id: string;
  title: string;
  origin: string;
  metadata: collection_metadata[];
  presentations: collection_presentations[];
  collectTime: any;
}
