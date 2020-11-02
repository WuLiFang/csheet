package cgteamwork

import "encoding/json"

// Message can have image attachment.
type Message struct {
	Text   string  `bson:"text" json:"text"`
	Images []Image `bson:"images" json:"image"`
}

// UnmarshalJSON implements json.Unmarshaler
func (m *Message) UnmarshalJSON(data []byte) (err error) {
	var doc = new(struct {
		Data   string
		Image  []Image
		Images []Image
	})
	err = json.Unmarshal(data, doc)
	if err != nil {
		return
	}
	m.Text = doc.Data
	if doc.Image != nil {
		m.Images = doc.Image
	} else {
		m.Images = doc.Images
	}
	return
}
