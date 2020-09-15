/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: cgteamworkProjects
// ====================================================

export interface cgteamworkProjects_cgteamworkProjects {
  __typename: "CGTeamworkProject";
  database: string;
  name: string;
  codename: string;
  status: string;
}

export interface cgteamworkProjects {
  cgteamworkProjects: cgteamworkProjects_cgteamworkProjects[] | null;
}

export interface cgteamworkProjectsVariables {
  q?: string | null;
  status?: string[] | null;
  database?: string[] | null;
}
