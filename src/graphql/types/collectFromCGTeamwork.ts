/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CollectFromCGTeamworkInput } from "./global";

// ====================================================
// GraphQL mutation operation: collectFromCGTeamwork
// ====================================================

export interface collectFromCGTeamwork_collectFromCGTeamwork {
  __typename: "CollectFromCGTeamworkPayload";
  originPrefix: string;
  updatedCount: number;
  createdCount: number;
}

export interface collectFromCGTeamwork {
  collectFromCGTeamwork: collectFromCGTeamwork_collectFromCGTeamwork | null;
}

export interface collectFromCGTeamworkVariables {
  input: CollectFromCGTeamworkInput;
}
