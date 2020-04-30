/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: presentation
// ====================================================

export interface presentation_raw {
  __typename: "File";
  path: string;
  modTime: any | null;
  size: number | null;
}

export interface presentation_thumb {
  __typename: "File";
  path: string;
}

export interface presentation_regular {
  __typename: "File";
  path: string;
}

export interface presentation {
  __typename: "Presentation";
  id: string;
  type: string;
  raw: presentation_raw;
  thumb: presentation_thumb | null;
  regular: presentation_regular | null;
  isRegularOutdated: boolean | null;
  isRegularTranscodeFailed: boolean | null;
}
