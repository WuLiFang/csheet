package migrations

func init() {
	addMigration(migration{
		1,
		"Drop collected event table",
		dropCollectedEventTable,
	})
	addMigration(migration{
		2,
		"Use base64 id",
		useBase64ID,
	})
	addMigration(migration{
		3,
		"Remove common key suffix",
		removeCommonKeySuffix,
	})
}
