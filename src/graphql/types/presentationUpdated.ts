/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: presentationUpdated
// ====================================================

export interface presentationUpdated_presentationUpdated_raw {
  __typename: "File";
  path: string;
  modTime: any | null;
  size: number | null;
}

export interface presentationUpdated_presentationUpdated_thumb {
  __typename: "File";
  path: string;
  modTime: any | null;
  size: number | null;
}

export interface presentationUpdated_presentationUpdated_regular {
  __typename: "File";
  path: string;
  modTime: any | null;
  size: number | null;
}

export interface presentationUpdated_presentationUpdated {
  __typename: "Presentation";
  id: string;
  type: string;
  raw: presentationUpdated_presentationUpdated_raw;
  thumb: presentationUpdated_presentationUpdated_thumb | null;
  regular: presentationUpdated_presentationUpdated_regular | null;
  isRegularOutdated: boolean | null;
  isRegularTranscodeFailed: boolean | null;
}

export interface presentationUpdated {
  presentationUpdated: presentationUpdated_presentationUpdated;
}

export interface presentationUpdatedVariables {
  id: string[];
  filePathFormat?: string | null;
}
