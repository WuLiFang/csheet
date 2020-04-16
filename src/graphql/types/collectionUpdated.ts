/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: collectionUpdated
// ====================================================

export interface collectionUpdated_collectionUpdated {
  __typename: "Collection";
  id: string;
  title: string;
  origin: string;
}

export interface collectionUpdated {
  collectionUpdated: collectionUpdated_collectionUpdated;
}

export interface collectionUpdatedVariables {
  id: string[];
}
