/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: collectionCGTeamworkNotes
// ====================================================

export interface collectionCGTeamworkNotes_node_Presentation {
  __typename: "Presentation";
  id: string;
}

export interface collectionCGTeamworkNotes_node_Collection_cgteamworkNotes_notes_message_images_max {
  __typename: "WebFile";
  url: string;
}

export interface collectionCGTeamworkNotes_node_Collection_cgteamworkNotes_notes_message_images_min {
  __typename: "WebFile";
  url: string;
}

export interface collectionCGTeamworkNotes_node_Collection_cgteamworkNotes_notes_message_images {
  __typename: "CGTeamworkImage";
  max: collectionCGTeamworkNotes_node_Collection_cgteamworkNotes_notes_message_images_max;
  min: collectionCGTeamworkNotes_node_Collection_cgteamworkNotes_notes_message_images_min;
}

export interface collectionCGTeamworkNotes_node_Collection_cgteamworkNotes_notes_message {
  __typename: "CGTeamworkMessage";
  html: string;
  images: collectionCGTeamworkNotes_node_Collection_cgteamworkNotes_notes_message_images[];
}

export interface collectionCGTeamworkNotes_node_Collection_cgteamworkNotes_notes {
  __typename: "CGTeamworkNote";
  type: string;
  message: collectionCGTeamworkNotes_node_Collection_cgteamworkNotes_notes_message;
  created: any;
  createdByName: string;
}

export interface collectionCGTeamworkNotes_node_Collection_cgteamworkNotes {
  __typename: "CollectionCGTeamworkNote";
  pipeline: string;
  notes: collectionCGTeamworkNotes_node_Collection_cgteamworkNotes_notes[];
}

export interface collectionCGTeamworkNotes_node_Collection {
  __typename: "Collection";
  id: string;
  cgteamworkNotes: collectionCGTeamworkNotes_node_Collection_cgteamworkNotes[] | null;
}

export type collectionCGTeamworkNotes_node = collectionCGTeamworkNotes_node_Presentation | collectionCGTeamworkNotes_node_Collection;

export interface collectionCGTeamworkNotes {
  node: collectionCGTeamworkNotes_node | null;
}

export interface collectionCGTeamworkNotesVariables {
  id: string;
  pipeline?: string[] | null;
}
