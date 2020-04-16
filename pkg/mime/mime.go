package mime

import "mime"

func init() {
	mime.AddExtensionType(".tga", "image/x-tga")
}
