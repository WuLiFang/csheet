.PHONY: default

default:
	gotmpl -o collection_gen.go resolve.go.gotmpl
	gotmpl -o collection_tag_gen.go resolve.go.gotmpl collection_tag.gotmpl  Node=String NodeType=string
