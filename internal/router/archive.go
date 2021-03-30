package router

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"github.com/WuLiFang/csheet/v6/pkg/archive"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

var invalidFileNameCharsReplacer = strings.NewReplacer(
	"?", "_",
	"<", "_",
	">", "_",
	"\\", "_",
	":", "_",
	"*", "_",
	"|", "_",
	"\"", "_",
	"/", "_",
)

func archiveHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx = c.Request.Context()

		var opts = []archive.PageOption{}
		if v, ok := c.GetQuery("origin_prefix"); ok {
			opts = append(opts, archive.PageOptionOriginPrefix(v))
		}
		if v, ok := c.GetQueryArray("tag_or"); ok {
			opts = append(opts, archive.PageOptionTagOr(v))
		}
		if v, ok := c.GetQueryArray("tag_and"); ok {
			opts = append(opts, archive.PageOptionTagAnd(v))
		}
		if v, ok := c.GetQuery("presentation_count_gt"); ok {
			num, err := strconv.Atoi(v)
			if err != nil {
				c.Status(http.StatusBadRequest)
				c.String(http.StatusBadRequest, "invalid value: presentation_count_gt: %s", v)
				return
			}
			opts = append(opts, archive.PageOptionPresentationCountGt(num))
		}
		var filename = fmt.Sprintf("csheet_%s.zip", time.Now().Format("2006-01-02_15-04-05"))
		if v, ok := c.GetQuery("title"); ok {
			opts = append(opts, archive.PageOptionTitle(v))
			filename = fmt.Sprintf("%s.zip", v)
		}
		if v, ok := c.GetQuery("file_path_format"); ok {
			opts = append(opts, archive.PageOptionFilePathFormat(v))
		}

		filename = invalidFileNameCharsReplacer.Replace(filename)
		c.Header("Content-Type", "application/zip")
		c.Header("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))
		c.Writer.Flush()

		err := archive.Zip(ctx, c.Writer, opts...)
		if err != nil {
			logging.For(ctx).Logger("router").Error("archive failed", zap.Error(err))
			return
		}
	}
}
