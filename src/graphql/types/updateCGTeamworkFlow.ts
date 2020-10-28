/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UpdateCGTeamworkFlowInput } from "./global";

// ====================================================
// GraphQL mutation operation: updateCGTeamworkFlow
// ====================================================

export interface updateCGTeamworkFlow_updateCGTeamworkFlow_updated_metadata {
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

export interface updateCGTeamworkFlow_updateCGTeamworkFlow_updated {
  __typename: "Collection";
  id: string;
  metadata: updateCGTeamworkFlow_updateCGTeamworkFlow_updated_metadata[];
}

export interface updateCGTeamworkFlow_updateCGTeamworkFlow {
  __typename: "UpdateCGTeamworkFlowPayload";
  updated: updateCGTeamworkFlow_updateCGTeamworkFlow_updated[] | null;
}

export interface updateCGTeamworkFlow {
  updateCGTeamworkFlow: updateCGTeamworkFlow_updateCGTeamworkFlow | null;
}

export interface updateCGTeamworkFlowVariables {
  input: UpdateCGTeamworkFlowInput;
}
