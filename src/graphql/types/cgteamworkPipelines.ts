/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: cgteamworkPipelines
// ====================================================

export interface cgteamworkPipelines_cgteamworkPipelines {
  __typename: "CGTeamworkPipeline";
  name: string;
  description: string;
  /**
   * order key for sort pipelines
   */
  order: string;
}

export interface cgteamworkPipelines {
  cgteamworkPipelines: cgteamworkPipelines_cgteamworkPipelines[] | null;
}

export interface cgteamworkPipelinesVariables {
  database: string;
  q?: string | null;
}
