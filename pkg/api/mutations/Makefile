.PHONY: default generate

default: generate

# TODO: make all mutation relay compatible

generate:
	# Use https://github.com/NateScarlet/gotmpl
	gotmpl -o updateCollectionMetadata.gql Model=Collection base.gql.gotmpl dataInput.gotmpl updateMetadata.gotmpl
	gotmpl -o updatePresentationMetadata.gql Model=Presentation base.gql.gotmpl dataInput.gotmpl updateMetadata.gotmpl
