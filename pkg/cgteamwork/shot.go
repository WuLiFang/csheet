package cgteamwork

// Episode created on cgteamwork
type Episode struct {
	ID   string
	Name string
}

// UnmarshalCGTeamworkRecord implement RecordUnmarshaler
func (i *Episode) UnmarshalCGTeamworkRecord(v map[string]string) error {
	i.ID = v["eps.id"]
	i.Name = v["eps.eps_name"]
	return nil
}

// Shot created on cgteamwork
type Shot struct {
	ID      string
	Title   string
	Episode Episode
}

// UnmarshalCGTeamworkRecord implement RecordUnmarshaler
func (i *Shot) UnmarshalCGTeamworkRecord(v map[string]string) error {
	i.ID = v["shot.id"]
	i.Title = v["shot.shot"]
	i.Episode.UnmarshalCGTeamworkRecord(v)
	return nil
}
