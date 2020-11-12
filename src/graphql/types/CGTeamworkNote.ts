/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: CGTeamworkNote
// ====================================================

export interface CGTeamworkNote_message_images_max {
  __typename: "WebFile";
  url: string;
}

export interface CGTeamworkNote_message_images_min {
  __typename: "WebFile";
  url: string;
}

export interface CGTeamworkNote_message_images {
  __typename: "CGTeamworkImage";
  max: CGTeamworkNote_message_images_max;
  min: CGTeamworkNote_message_images_min;
}

export interface CGTeamworkNote_message {
  __typename: "CGTeamworkMessage";
  html: string;
  images: CGTeamworkNote_message_images[];
}

export interface CGTeamworkNote {
  __typename: "CGTeamworkNote";
  id: string;
  type: string;
  message: CGTeamworkNote_message;
  created: any;
  createdByName: string;
}
