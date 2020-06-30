/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: collectionUpdated
// ====================================================

export interface collectionUpdated_collectionUpdated_metadata {
  __typename: 'StringEntry';
  /**
   * key
   */
  k: string;
  /**
   * value
   */
  v: string;
}

export interface collectionUpdated_collectionUpdated_presentations_raw {
  __typename: 'DiskFile';
  path: string;
  modTime: any | null;
  size: number | null;
}

export interface collectionUpdated_collectionUpdated_presentations_thumb {
  __typename: 'WebFile';
  url: string;
}

export interface collectionUpdated_collectionUpdated_presentations_regular {
  __typename: 'WebFile';
  url: string;
}

export interface collectionUpdated_collectionUpdated_presentations {
  __typename: 'Presentation';
  id: string;
  type: string;
  raw: collectionUpdated_collectionUpdated_presentations_raw;
  thumb: collectionUpdated_collectionUpdated_presentations_thumb | null;
  isThumbTranscodeFailed: boolean | null;
  regular: collectionUpdated_collectionUpdated_presentations_regular | null;
  isRegularOutdated: boolean | null;
  isRegularTranscodeFailed: boolean | null;
}

export interface collectionUpdated_collectionUpdated {
  __typename: 'Collection';
  id: string;
  title: string;
  origin: string;
  metadata: collectionUpdated_collectionUpdated_metadata[];
  presentations: collectionUpdated_collectionUpdated_presentations[];
  collectTime: any;
}

export interface collectionUpdated {
  collectionUpdated: collectionUpdated_collectionUpdated;
}

export interface collectionUpdatedVariables {
  id: string[];
  filePathFormat?: string | null;
}
