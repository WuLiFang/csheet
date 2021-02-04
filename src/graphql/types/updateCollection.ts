/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UpdateCollectionInput } from "./global";

// ====================================================
// GraphQL mutation operation: updateCollection
// ====================================================

export interface updateCollection_updateCollection_updated {
  __typename: "Collection";
  id: string;
  tags: string[];
}

export interface updateCollection_updateCollection {
  __typename: "UpdateCollectionPayload";
  updated: updateCollection_updateCollection_updated[] | null;
}

export interface updateCollection {
  updateCollection: updateCollection_updateCollection | null;
}

export interface updateCollectionVariables {
  input: UpdateCollectionInput;
}
