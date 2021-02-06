/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: collectionStats
// ====================================================

export interface collectionStats_collections_tagCount {
  __typename: "CollectionTagCount";
  tag: string;
  count: number;
}

export interface collectionStats_collections {
  __typename: "CollectionConnection";
  totalCount: number | null;
  tagCount: collectionStats_collections_tagCount[] | null;
}

export interface collectionStats {
  collections: collectionStats_collections;
}

export interface collectionStatsVariables {
  originPrefix?: string | null;
  presentationCountGt?: number | null;
  tagOr?: string[] | null;
  tagAnd?: string[] | null;
}
