/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DeleteCGTeamworkNoteInput } from "./global";

// ====================================================
// GraphQL mutation operation: deleteCGTeamworkNote
// ====================================================

export interface deleteCGTeamworkNote_deleteCGTeamworkNote {
  __typename: "DeleteCGTeamworkNotePayload";
  deletedCount: number;
}

export interface deleteCGTeamworkNote {
  deleteCGTeamworkNote: deleteCGTeamworkNote_deleteCGTeamworkNote | null;
}

export interface deleteCGTeamworkNoteVariables {
  input: DeleteCGTeamworkNoteInput;
}
