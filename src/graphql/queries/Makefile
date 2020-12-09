.PHONY: build

build:
	# https://github.com/NateScarlet/gotmpl
	gotmpl -o cgteamworkFlows.ts base.ts.gotmpl array.gotmpl Item=CGTeamworkFlow
	gotmpl -o cgteamworkPipelines.ts base.ts.gotmpl array.gotmpl Item=CGTeamworkPipeline
	gotmpl -o cgteamworkProjects.ts base.ts.gotmpl array.gotmpl Item=CGTeamworkProject
	gotmpl -o cgteamworkStatuses.ts base.ts.gotmpl array.gotmpl Item=CGTeamworkStatus NoVariables=true
	gotmpl -o clientConfig.ts base.ts.gotmpl
	gotmpl -o collectionCGTeamworkNotes.ts base.ts.gotmpl node.gotmpl Node=Collection
	gotmpl -o collectionNode.ts base.ts.gotmpl node.gotmpl
	gotmpl -o collections.ts base.ts.gotmpl connection.gotmpl
	gotmpl -o folderOriginPrefix.ts base.ts.gotmpl
	gotmpl -o presentationNode.ts base.ts.gotmpl node.gotmpl
	ls *.gql | jq -nR 'reduce inputs as $$item ([]; . + [$$item]) | { Files: . }' | gotmpl -o index.queries.ts index.queries.ts.gotmpl
	npx prettier --write *.ts
