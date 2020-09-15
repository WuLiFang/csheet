package migrations

func init() {
	addMigration(migration{
		1,
		"Drop collected event table",
		dropCollectedEventTable,
	})
}
