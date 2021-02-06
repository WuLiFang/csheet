.PHONY: default

# TODO: use prefix as cursor

default:
	gotmpl -o collection_gen.go resolve.go.gotmpl
	gotmpl -o collection_tag_gen.go resolve.go.gotmpl collection_tag.gotmpl  Node=String NodeType=string
