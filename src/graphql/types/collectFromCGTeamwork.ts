/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: collectFromCGTeamwork
// ====================================================

export interface collectFromCGTeamwork_collectFromCGTeamwork {
  __typename: "CollectedEvent";
  id: string;
  originPrefix: string;
  time: any;
  updatedCount: number;
}

export interface collectFromCGTeamwork {
  collectFromCGTeamwork: collectFromCGTeamwork_collectFromCGTeamwork;
}

export interface collectFromCGTeamworkVariables {
  database: string;
  prefix: string;
  pipeline: string;
}
