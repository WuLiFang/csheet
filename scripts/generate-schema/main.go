package main

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"net/http/httptest"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/WuLiFang/csheet/v6/pkg/api"
)

var introspection = `
query IntrospectionQuery {
	__schema {
	  queryType {
		name
	  }
	  mutationType {
		name
	  }
	  subscriptionType {
		name
	  }
	  types {
		...FullType
	  }
	  directives {
		name
		description
		locations
		args {
		  ...InputValue
		}
	  }
	}
  }
  
  fragment FullType on __Type {
	kind
	name
	description
	fields(includeDeprecated: true) {
	  name
	  description
	  args {
		...InputValue
	  }
	  type {
		...TypeRef
	  }
	  isDeprecated
	  deprecationReason
	}
	inputFields {
	  ...InputValue
	}
	interfaces {
	  ...TypeRef
	}
	enumValues(includeDeprecated: true) {
	  name
	  description
	  isDeprecated
	  deprecationReason
	}
	possibleTypes {
	  ...TypeRef
	}
  }
  
  fragment InputValue on __InputValue {
	name
	description
	type {
	  ...TypeRef
	}
	defaultValue
  }
  
  fragment TypeRef on __Type {
	kind
	name
	ofType {
	  kind
	  name
	  ofType {
		kind
		name
		ofType {
		  kind
		  name
		  ofType {
			kind
			name
			ofType {
			  kind
			  name
			  ofType {
				kind
				name
				ofType {
				  kind
				  name
				}
			  }
			}
		  }
		}
	  }
	}
  }
`

func main() {
	server := httptest.NewServer(handler.NewDefaultServer(api.NewExecutableSchema()))
	defer server.Close()
	client := server.Client()
	data, err := json.Marshal(map[string]interface{}{"query": introspection})
	if err != nil {
		panic(err)
	}
	resp, err := client.Post(server.URL, "application/json", bytes.NewReader(data))
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()
	data, err = ioutil.ReadAll(resp.Body)
	if err != nil {
		panic(err)
	}
	os.Remove("schema.json")
	err = ioutil.WriteFile("schema.json", data, 0x644)
	if err != nil {
		panic(err)
	}
}
