package collection

// OriginSeperator used to join parts
const OriginSeperator = ":"

// Origin build from parts.
func Origin(parts ...string) (ret string) {
	for index, i := range parts {
		ret += i
		if index < len(parts)-1 {
			ret += OriginSeperator
		}
	}
	return
}
