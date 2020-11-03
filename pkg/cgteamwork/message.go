package cgteamwork

import "encoding/json"

// Message can have image attachment.
type Message struct {
	HTML   string  `json:"data"`
	Images []Image `json:"image"`
}

// MarshalJSON implements json.Marshaler
func (m Message) MarshalJSON() ([]byte, error) {
	images := m.Images
	if images == nil {
		images = make([]Image, 0)
	}
	return json.Marshal(map[string]interface{}{
		"data":  m.HTML,
		"image": images,
	})
}
