package cgteamwork

import "context"

// Project is a created project
type Project struct {
	ID       string
	Status   string
	Name     string
	Codename string
	Database string
}

// UnmarshalCGTeamworkRecord implement RecordUnmarshaler
func (i *Project) UnmarshalCGTeamworkRecord(v map[string]string) error {
	i.ID = v["project.id"]
	i.Status = v["project.status"]
	i.Name = v["project.full_name"]
	i.Codename = v["project.code"]
	i.Database = v["project.database"]
	return nil
}

// ListProjects with filter.
func (c *Client) ListProjects(ctx context.Context, filter func(Selection) Selection) ([]Project, error) {
	s := c.Select("public", "project")
	if filter != nil {
		s = filter(s)
	}
	rs, err := s.Values(
		ctx,
		"project.id",
		"project.status",
		"project.full_name",
		"project.code",
		"project.database",
	)
	if err != nil {
		return nil, err
	}
	ret := make([]Project, rs.Count())
	err = rs.Unmarshal(func(i int) RecordUnmarshaler {
		return &ret[i]
	})
	return ret, err
}
