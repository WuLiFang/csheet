.PHONY: build

build:
	# https://github.com/NateScarlet/gotmpl
	gotmpl -o cgteamworkStatuses.ts base.ts.gotmpl array.gotmpl Item=CGTeamworkStatus
	gotmpl -o cgteamworkFlows.ts base.ts.gotmpl array.gotmpl Item=CGTeamworkFlow
	gotmpl -o collectionNode.ts base.ts.gotmpl node.gotmpl
