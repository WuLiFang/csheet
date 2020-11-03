/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CreateCGTeamworkNoteInput } from "./global";

// ====================================================
// GraphQL mutation operation: createCGTeamworkNote
// ====================================================

export interface createCGTeamworkNote_createCGTeamworkNote_updatedCollections_cgteamworkNotes_notes_message_images_max {
  __typename: "WebFile";
  url: string;
}

export interface createCGTeamworkNote_createCGTeamworkNote_updatedCollections_cgteamworkNotes_notes_message_images_min {
  __typename: "WebFile";
  url: string;
}

export interface createCGTeamworkNote_createCGTeamworkNote_updatedCollections_cgteamworkNotes_notes_message_images {
  __typename: "CGTeamworkImage";
  max: createCGTeamworkNote_createCGTeamworkNote_updatedCollections_cgteamworkNotes_notes_message_images_max;
  min: createCGTeamworkNote_createCGTeamworkNote_updatedCollections_cgteamworkNotes_notes_message_images_min;
}

export interface createCGTeamworkNote_createCGTeamworkNote_updatedCollections_cgteamworkNotes_notes_message {
  __typename: "CGTeamworkMessage";
  html: string;
  images: createCGTeamworkNote_createCGTeamworkNote_updatedCollections_cgteamworkNotes_notes_message_images[];
}

export interface createCGTeamworkNote_createCGTeamworkNote_updatedCollections_cgteamworkNotes_notes {
  __typename: "CGTeamworkNote";
  type: string;
  message: createCGTeamworkNote_createCGTeamworkNote_updatedCollections_cgteamworkNotes_notes_message;
  created: any;
  createdByName: string;
}

export interface createCGTeamworkNote_createCGTeamworkNote_updatedCollections_cgteamworkNotes {
  __typename: "CollectionCGTeamworkNote";
  pipeline: string;
  notes: createCGTeamworkNote_createCGTeamworkNote_updatedCollections_cgteamworkNotes_notes[];
}

export interface createCGTeamworkNote_createCGTeamworkNote_updatedCollections {
  __typename: "Collection";
  id: string;
  cgteamworkNotes: createCGTeamworkNote_createCGTeamworkNote_updatedCollections_cgteamworkNotes[] | null;
}

export interface createCGTeamworkNote_createCGTeamworkNote {
  __typename: "CreateCGTeamworkNotePayload";
  updatedCollections: createCGTeamworkNote_createCGTeamworkNote_updatedCollections[] | null;
}

export interface createCGTeamworkNote {
  createCGTeamworkNote: createCGTeamworkNote_createCGTeamworkNote | null;
}

export interface createCGTeamworkNoteVariables {
  input: CreateCGTeamworkNoteInput;
}
