package cgteamwork

import (
	"fmt"

	"github.com/tidwall/gjson"
)

// ResultSet store query result.
type ResultSet struct {
	Fields []string
	Data   gjson.Result
}

// Count data rows.
func (rs ResultSet) Count() int {
	return int(rs.Data.Get("#").Int())
}

// RecordUnmarshaler allow unmarshal from a result set row
type RecordUnmarshaler interface {
	UnmarshalCGTeamworkRecord(data map[string]string) error
}

// Unmarshal iterate through all data in map form.
func (rs ResultSet) Unmarshal(fn func(index int) RecordUnmarshaler) error {
	rowCount := rs.Count()
	for row := 0; row < rowCount; row++ {
		ptr := fn(row)
		if ptr == nil {
			continue
		}
		data := map[string]string{}
		for col, name := range rs.Fields {
			data[name] = rs.Data.Get(fmt.Sprintf("%d.%d", row, col)).String()
		}
		err := ptr.UnmarshalCGTeamworkRecord(data)
		if err != nil {
			return err
		}
	}
	return nil
}

// Field data
func (rs ResultSet) Field(field string) []gjson.Result {
	var index = -1
	for i, v := range rs.Fields {
		if v == field {
			index = i
			break
		}
	}
	if index < 0 {
		return nil
	}
	return rs.Data.Get(fmt.Sprintf("#.%d", index)).Array()
}
