package cmd

import (
	"context"
	"fmt"

	"github.com/spf13/cobra"
)

var skipBackup = false
var skipDrop = false

var restoreCmd = &cobra.Command{
	Use:   "restore [backup file]",
	Short: "restore database",
	Args:  cobra.MinimumNArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		res, err := restore(context.Background(), args[0], skipBackup, skipDrop)
		if err != nil {
			return err
		}
		fmt.Printf(res.Raw)
		return nil
	},
}

func init() {
	restoreCmd.Flags().BoolVar(&skipBackup, "skip-backup", false, "skip backup before restore database")
	restoreCmd.Flags().BoolVar(&skipDrop, "skip-drop", false, "skip drop before restore database")
}
