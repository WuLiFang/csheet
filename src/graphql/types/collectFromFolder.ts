/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: collectFromFolder
// ====================================================

export interface collectFromFolder_collectFromFolder {
  __typename: "CollectedEvent";
  id: string;
  originPrefix: string;
  time: any;
  updatedCount: number;
}

export interface collectFromFolder {
  collectFromFolder: collectFromFolder_collectFromFolder;
}

export interface collectFromFolderVariables {
  root: string;
}
