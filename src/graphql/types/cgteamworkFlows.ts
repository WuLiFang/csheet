/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: cgteamworkFlows
// ====================================================

export interface cgteamworkFlows_cgteamworkFlows_pipeline {
  __typename: "CGTeamworkPipeline";
  name: string;
}

export interface cgteamworkFlows_cgteamworkFlows_stages_statuses {
  __typename: "CGTeamworkStatus";
  id: string;
  name: string;
  color: string;
}

export interface cgteamworkFlows_cgteamworkFlows_stages {
  __typename: "CGTeamworkFlowStage";
  id: string;
  name: string;
  statuses: cgteamworkFlows_cgteamworkFlows_stages_statuses[];
}

export interface cgteamworkFlows_cgteamworkFlows {
  __typename: "CGTeamworkFlow";
  name: string;
  pipeline: cgteamworkFlows_cgteamworkFlows_pipeline;
  stages: cgteamworkFlows_cgteamworkFlows_stages[];
}

export interface cgteamworkFlows {
  cgteamworkFlows: cgteamworkFlows_cgteamworkFlows[];
}

export interface cgteamworkFlowsVariables {
  database: string;
  pipeline?: string[] | null;
}
