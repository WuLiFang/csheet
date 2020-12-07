/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: cgteamworkStatuses
// ====================================================

export interface cgteamworkStatuses_cgteamworkStatuses {
  __typename: "CGTeamworkStatus";
  id: string;
  name: string;
  color: string;
}

export interface cgteamworkStatuses {
  cgteamworkStatuses: cgteamworkStatuses_cgteamworkStatuses[];
}

export interface cgteamworkStatusesVariables {
  database: string;
  pipeline?: string[] | null;
}
