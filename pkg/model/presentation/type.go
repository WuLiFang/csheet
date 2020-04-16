package presentation

import (
	"errors"
	"strings"
)

// Type for diffrent presentation style
type Type string

const (
	// TypeImage present collection as image
	TypeImage Type = "image"
	// TypeVideo present collection as video
	TypeVideo Type = "video"
)

// TypeByMimeType choose type by mimetype.
func TypeByMimeType(mt string) (Type, error) {
	if strings.HasPrefix(mt, "image/") {
		return TypeImage, nil
	}
	if strings.HasPrefix(mt, "video/") {
		return TypeVideo, nil
	}
	return "", errors.New("unknown mimetype")
}
