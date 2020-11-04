/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: cgteamworkNote
// ====================================================

export interface cgteamworkNote_message_images_max {
  __typename: "WebFile";
  url: string;
}

export interface cgteamworkNote_message_images_min {
  __typename: "WebFile";
  url: string;
}

export interface cgteamworkNote_message_images {
  __typename: "CGTeamworkImage";
  max: cgteamworkNote_message_images_max;
  min: cgteamworkNote_message_images_min;
}

export interface cgteamworkNote_message {
  __typename: "CGTeamworkMessage";
  html: string;
  images: cgteamworkNote_message_images[];
}

export interface cgteamworkNote {
  __typename: "CGTeamworkNote";
  id: string;
  type: string;
  message: cgteamworkNote_message;
  created: any;
  createdByName: string;
}
