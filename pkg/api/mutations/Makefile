.PHONY: default generate

default: generate

generate:
	# Use https://github.com/NateScarlet/gotmpl
	gotmpl -o updateCollection.gql Model=Collection base.gql.gotmpl dataInput.gotmpl updateCollection.gotmpl
	gotmpl -o updateCollectionMetadata.gql Model=Collection base.gql.gotmpl dataInput.gotmpl updateMetadata.gotmpl
	gotmpl -o updatePresentationMetadata.gql Model=Presentation base.gql.gotmpl dataInput.gotmpl updateMetadata.gotmpl
	gotmpl -o updateCGTeamworkFlow.gql Model=Collection base.gql.gotmpl dataInput.gotmpl updateCGTeamworkFlow.gotmpl
	gotmpl -o createCGTeamworkNote.gql base.gql.gotmpl dataInput.gotmpl cgteamworkNote.gotmpl
	gotmpl -o deleteCGTeamworkNote.gql base.gql.gotmpl cgteamworkNote.gotmpl 
	gotmpl -o backupDatabase.gql base.gql.gotmpl backupDatabase.gotmpl 
	gotmpl -o restoreDatabase.gql base.gql.gotmpl restoreDatabase.gotmpl 
	gotmpl -o collectFromCGTeamwork.gql base.gql.gotmpl collectFromCGTeamwork.gotmpl InputNullable=true
	gotmpl -o collectFromFolder.gql base.gql.gotmpl collectFromFolder.gotmpl InputNullable=true
