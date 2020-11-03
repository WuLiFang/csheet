/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CreateCGTeamworkNoteInput } from "./global";

// ====================================================
// GraphQL mutation operation: createCGTeamworkNote
// ====================================================

export interface createCGTeamworkNote_createCGTeamworkNote {
  __typename: "CreateCGTeamworkNotePayload";
  createdCount: number;
}

export interface createCGTeamworkNote {
  createCGTeamworkNote: createCGTeamworkNote_createCGTeamworkNote | null;
}

export interface createCGTeamworkNoteVariables {
  input: CreateCGTeamworkNoteInput;
}
