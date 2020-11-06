package cmd

import (
	"context"
	"fmt"

	"github.com/spf13/cobra"
)

var backupCmd = &cobra.Command{
	Use:   "backup",
	Short: "backup database",
	Args:  cobra.NoArgs,
	RunE: func(cmd *cobra.Command, args []string) error {
		res, err := backup(context.Background())
		if err != nil {
			return err
		}
		fmt.Printf(res.Raw)
		return nil
	},
}
