package unipath

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestUnix(t *testing.T) {
	Rule = DefaultRule
	cases := [][3]string{
		{"unix", "/c/Users", "/c/Users"},
		{"windows", "C:/Users", "/c/Users"},
		{"windows lower", "c:/Users", "/c/Users"},
		{"relative", "a/b/c", "a/b/c"},
		{"root", "C:/", "/c"},
		{"slash", "C:\\", "/c"},
		{"empty", "", ""},
	}
	for _, cs := range cases {
		c := cs
		t.Run(
			c[0],
			func(t *testing.T) {
				p := Unix(c[1])
				assert.Equal(t, c[2], p)
			},
		)
	}
}
