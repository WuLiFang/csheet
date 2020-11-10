package cgteamwork

// Asset from asset module
type Asset struct {
	ID          string
	Type        string
	Name        string
	DisplayName string
}

// UnmarshalCGTeamworkRecord implement RecordUnmarshaler
func (i *Asset) UnmarshalCGTeamworkRecord(v map[string]string) error {
	i.ID = v["asset.id"]
	i.Name = v["asset.asset_name"]
	i.Type = v["asset.type_name"]
	i.DisplayName = v["asset.cn_name"]
	return nil
}

// DisplayNameOrName returns `displayName ? displayName : name`
func (i Asset) DisplayNameOrName() string {
	if i.DisplayName != "" {
		return i.DisplayName
	}
	return i.Name
}
