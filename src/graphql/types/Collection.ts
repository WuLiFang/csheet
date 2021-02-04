/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: Collection
// ====================================================

export interface Collection_metadata {
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

export interface Collection_presentations_raw {
  __typename: "DiskFile";
  path: string;
  modTime: import('./scalars').Time | null;
  size: number | null;
}

export interface Collection_presentations_thumb {
  __typename: "WebFile";
  url: string;
}

export interface Collection_presentations_regular {
  __typename: "WebFile";
  url: string;
}

export interface Collection_presentations_metadata {
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

export interface Collection_presentations {
  __typename: "Presentation";
  id: string;
  type: string;
  raw: Collection_presentations_raw;
  thumb: Collection_presentations_thumb | null;
  isThumbTranscodeFailed: boolean | null;
  regular: Collection_presentations_regular | null;
  isRegularOutdated: boolean | null;
  isRegularTranscodeFailed: boolean | null;
  metadata: Collection_presentations_metadata[];
}

export interface Collection {
  __typename: "Collection";
  id: string;
  title: string;
  origin: string;
  metadata: Collection_metadata[];
  presentations: Collection_presentations[];
  collectTime: import('./scalars').Time;
  tags: string[];
}
