// Code generated by github.com/99designs/gqlgen, DO NOT EDIT.

package model

import (
	"github.com/WuLiFang/csheet/v6/pkg/model/collection"
	"github.com/WuLiFang/csheet/v6/pkg/model/presentation"
)

type Node interface {
	IsNode()
}

type ClientConfig struct {
	SentryDsn       *string `json:"sentryDSN"`
	IssueTrackerURL *string `json:"issueTrackerURL"`
}

type CollectionConnection struct {
	Edges    []*CollectionEdge        `json:"edges"`
	Nodes    []*collection.Collection `json:"nodes"`
	PageInfo *PageInfo                `json:"pageInfo"`
}

type CollectionEdge struct {
	Cursor string                 `json:"cursor"`
	Node   *collection.Collection `json:"node"`
}

type PageInfo struct {
	StartCursor     *string `json:"startCursor"`
	EndCursor       *string `json:"endCursor"`
	HasNextPage     bool    `json:"hasNextPage"`
	HasPreviousPage bool    `json:"hasPreviousPage"`
}

type StringEntry struct {
	// key
	K string `json:"k"`
	// value
	V string `json:"v"`
}

// Autogenerated input type of UpdateCGTeamworkFlow
type UpdateCGTeamworkFlowInput struct {
	Data             []UpdateCGTeamworkFlowInputData `json:"data"`
	Username         string                          `json:"username"`
	Password         string                          `json:"password"`
	ClientMutationID *string                         `json:"clientMutationId"`
}

type UpdateCGTeamworkFlowInputData struct {
	ID     string `json:"id"`
	Stage  string `json:"stage"`
	Status string `json:"status"`
	// Default to collection pipeline.
	Pipeline *string `json:"pipeline"`
	Note     *string `json:"note"`
}

// Autogenerated return type of UpdateCGTeamworkFlow
type UpdateCGTeamworkFlowPayload struct {
	Updated          []collection.Collection `json:"updated"`
	ClientMutationID *string                 `json:"clientMutationId"`
}

// Autogenerated input type of UpdateCollectionMetadata
type UpdateCollectionMetadataInput struct {
	Data             []UpdateCollectionMetadataInputData `json:"data"`
	ClientMutationID *string                             `json:"clientMutationId"`
}

type UpdateCollectionMetadataInputData struct {
	ID    string `json:"id"`
	Key   string `json:"key"`
	Value string `json:"value"`
}

// Autogenerated return type of UpdateCollectionMetadata
type UpdateCollectionMetadataPayload struct {
	Updated          []collection.Collection `json:"updated"`
	ClientMutationID *string                 `json:"clientMutationId"`
}

// Autogenerated input type of UpdatePresentationMetadata
type UpdatePresentationMetadataInput struct {
	Data             []UpdatePresentationMetadataInputData `json:"data"`
	ClientMutationID *string                               `json:"clientMutationId"`
}

type UpdatePresentationMetadataInputData struct {
	ID    string `json:"id"`
	Key   string `json:"key"`
	Value string `json:"value"`
}

// Autogenerated return type of UpdatePresentationMetadata
type UpdatePresentationMetadataPayload struct {
	Updated          []presentation.Presentation `json:"updated"`
	ClientMutationID *string                     `json:"clientMutationId"`
}

type WebFile struct {
	URL string `json:"url"`
}
