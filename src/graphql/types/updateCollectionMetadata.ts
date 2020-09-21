/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UpdateCollectionMetadataInput } from "./global";

// ====================================================
// GraphQL mutation operation: updateCollectionMetadata
// ====================================================

export interface updateCollectionMetadata_updateCollectionMetadata_updated_metadata {
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

export interface updateCollectionMetadata_updateCollectionMetadata_updated {
  __typename: "Collection";
  id: string;
  metadata: updateCollectionMetadata_updateCollectionMetadata_updated_metadata[];
}

export interface updateCollectionMetadata_updateCollectionMetadata {
  __typename: "UpdateCollectionMetadataPayload";
  updated: updateCollectionMetadata_updateCollectionMetadata_updated[] | null;
}

export interface updateCollectionMetadata {
  updateCollectionMetadata: updateCollectionMetadata_updateCollectionMetadata | null;
}

export interface updateCollectionMetadataVariables {
  input: UpdateCollectionMetadataInput;
}
