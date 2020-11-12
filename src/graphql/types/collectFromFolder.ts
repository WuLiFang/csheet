/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CollectFromFolderInput } from "./global";

// ====================================================
// GraphQL mutation operation: collectFromFolder
// ====================================================

export interface collectFromFolder_collectFromFolder {
  __typename: "CollectFromFolderPayload";
  originPrefix: string;
  updatedCount: number;
  createdCount: number;
}

export interface collectFromFolder {
  collectFromFolder: collectFromFolder_collectFromFolder | null;
}

export interface collectFromFolderVariables {
  input: CollectFromFolderInput;
}
