/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: presentation
// ====================================================

export interface presentation_raw {
  __typename: "DiskFile";
  path: string;
  modTime: any | null;
  size: number | null;
}

export interface presentation_thumb {
  __typename: "WebFile";
  url: string;
}

export interface presentation_regular {
  __typename: "WebFile";
  url: string;
}

export interface presentation_metadata {
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

export interface presentation {
  __typename: "Presentation";
  id: string;
  type: string;
  raw: presentation_raw;
  thumb: presentation_thumb | null;
  isThumbTranscodeFailed: boolean | null;
  regular: presentation_regular | null;
  isRegularOutdated: boolean | null;
  isRegularTranscodeFailed: boolean | null;
  metadata: presentation_metadata[];
}
