/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: clientConfig
// ====================================================

export interface clientConfig_clientConfig {
  __typename: "ClientConfig";
  sentryDSN: string | null;
  sentryTracesSampleRate: number | null;
  issueTrackerURL: string | null;
  enableCGTeamwork: boolean;
  folderInclude: string[] | null;
}

export interface clientConfig {
  clientConfig: clientConfig_clientConfig | null;
}

export interface clientConfigVariables {
  filePathFormat?: string | null;
}
