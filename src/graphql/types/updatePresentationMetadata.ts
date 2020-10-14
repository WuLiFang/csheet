/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UpdatePresentationMetadataInput } from "./global";

// ====================================================
// GraphQL mutation operation: updatePresentationMetadata
// ====================================================

export interface updatePresentationMetadata_updatePresentationMetadata_updated_metadata {
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

export interface updatePresentationMetadata_updatePresentationMetadata_updated {
  __typename: "Presentation";
  id: string;
  metadata: updatePresentationMetadata_updatePresentationMetadata_updated_metadata[];
}

export interface updatePresentationMetadata_updatePresentationMetadata {
  __typename: "UpdatePresentationMetadataPayload";
  updated: updatePresentationMetadata_updatePresentationMetadata_updated[] | null;
}

export interface updatePresentationMetadata {
  updatePresentationMetadata: updatePresentationMetadata_updatePresentationMetadata | null;
}

export interface updatePresentationMetadataVariables {
  input: UpdatePresentationMetadataInput;
}
