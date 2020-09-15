/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: collectFromCGTeamwork
// ====================================================

export interface collectFromCGTeamwork_collectFromCGTeamwork {
  __typename: "CollectResult";
  originPrefix: string;
  updatedCount: number;
  createdCount: number;
}

export interface collectFromCGTeamwork {
  collectFromCGTeamwork: collectFromCGTeamwork_collectFromCGTeamwork;
}

export interface collectFromCGTeamworkVariables {
  database: string;
  prefix: string;
  pipeline: string;
}
