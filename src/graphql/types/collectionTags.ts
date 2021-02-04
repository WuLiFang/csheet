/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: collectionTags
// ====================================================

export interface collectionTags_collectionTags_pageInfo {
  __typename: "PageInfo";
  startCursor: string | null;
  endCursor: string | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface collectionTags_collectionTags {
  __typename: "StringConnection";
  /**
   * A list of nodes.
   */
  nodes: (string | null)[] | null;
  /**
   * Information to aid in pagination.
   */
  pageInfo: collectionTags_collectionTags_pageInfo;
}

export interface collectionTags {
  collectionTags: collectionTags_collectionTags;
}

export interface collectionTagsVariables {
  after?: string | null;
  before?: string | null;
  first?: number | null;
  last?: number | null;
  regex?: string | null;
}
