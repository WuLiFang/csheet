/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: Presentation
// ====================================================

export interface Presentation_raw {
  __typename: "DiskFile";
  path: string;
  modTime: any | null;
  size: number | null;
}

export interface Presentation_thumb {
  __typename: "WebFile";
  url: string;
}

export interface Presentation_regular {
  __typename: "WebFile";
  url: string;
}

export interface Presentation_metadata {
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

export interface Presentation {
  __typename: "Presentation";
  id: string;
  type: string;
  raw: Presentation_raw;
  thumb: Presentation_thumb | null;
  isThumbTranscodeFailed: boolean | null;
  regular: Presentation_regular | null;
  isRegularOutdated: boolean | null;
  isRegularTranscodeFailed: boolean | null;
  metadata: Presentation_metadata[];
}
