package logging

import (
	"context"
	"strings"
	"time"

	"github.com/getsentry/sentry-go"
	"go.uber.org/zap/zapcore"
)

// SentryCore wrap other core with sentry event sending.
type SentryCore struct {
	zapcore.LevelEnabler
	fields []zapcore.Field
}

func sentryLevel(lvl zapcore.Level) sentry.Level {
	switch lvl {
	case zapcore.DebugLevel:
		return sentry.LevelDebug
	case zapcore.InfoLevel:
		return sentry.LevelInfo
	case zapcore.WarnLevel:
		return sentry.LevelWarning
	case zapcore.ErrorLevel:
		return sentry.LevelError
	default:
		return sentry.LevelFatal
	}
}

// With implements zapcore.Core
func (c *SentryCore) With(fields []zapcore.Field) zapcore.Core {
	return &SentryCore{
		LevelEnabler: c.LevelEnabler,
		fields:       append(c.fields, fields...),
	}
}

// Check implements zapcore.Core
func (c *SentryCore) Check(ent zapcore.Entry, ce *zapcore.CheckedEntry) *zapcore.CheckedEntry {
	if c.Enabled(ent.Level) {
		ce.AddCore(ent, c)
	}
	return ce
}

var nonAppModule = []string{
	"go.uber.org/zap",
	"github.com/WuLiFang/csheet/v6/pkg/logging",
}

func inApp(module string) bool {
	for _, i := range nonAppModule {
		if i == module ||
			strings.HasPrefix(module, i+"/") {
			return false
		}
	}
	return true
}

func newStackTrace() *sentry.Stacktrace {
	var ret = sentry.NewStacktrace()
	for index, i := range ret.Frames {
		if !i.InApp {
			continue
		}
		i.InApp = inApp(i.Module)
		ret.Frames[index] = i
	}
	return ret
}

func (c *SentryCore) Write(entry zapcore.Entry, fields []zapcore.Field) error {
	event := sentry.NewEvent()
	event.Message = entry.Message
	event.Timestamp = entry.Time
	event.Level = sentryLevel(entry.Level)
	enc := zapcore.NewMapObjectEncoder()
	for _, i := range append(c.fields, fields...) {
		i.AddTo(enc)
	}
	event.Extra = enc.Fields

	if trace := newStackTrace(); trace != nil {
		event.Exception = []sentry.Exception{{
			Type:       entry.Message,
			Value:      entry.Caller.TrimmedPath(),
			Stacktrace: trace,
		}}
	}

	sentry.CaptureEvent(event)
	return nil
}

// Sync implements zapcore.Core
func (c *SentryCore) Sync() error {
	if !sentry.Flush(3 * time.Second) {
		return context.DeadlineExceeded
	}
	return nil
}
