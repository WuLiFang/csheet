package archive

import (
	"encoding/json"
	"html/template"
	"io"
	"io/ioutil"
)

func RenderIndex(w io.Writer, pageData json.RawMessage) (err error) {
	data, err := ioutil.ReadFile("dist/index.static.html")
	if err != nil {
		return
	}

	indexTemplate, err := template.New("").Parse(string(data))
	if err != nil {
		return
	}

	err = indexTemplate.Execute(w, pageData)
	if err != nil {
		return
	}
	return
}
