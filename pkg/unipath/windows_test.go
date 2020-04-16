package unipath

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestWindows(t *testing.T) {
	Rule = DefaultRule
	cases := [][3]string{
		{"unix", "/c/Users", "c:/users"},
		{"windows", "C:/Users", "c:/users"},
		{"relative", "a/b/c", "a/b/c"},
		{"root", "/e", "e:/"},
		{"not match", "/etc", "/etc"},
		{"slash", "c:\\Users", "c:/users"},
		{"empty", "", ""},
	}
	for _, cs := range cases {
		c := cs
		t.Run(
			c[0],
			func(t *testing.T) {
				p := Windows(c[1])
				assert.Equal(t, c[2], p)
			},
		)
	}
}
