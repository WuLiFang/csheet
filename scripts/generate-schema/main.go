package main

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"net/http/httptest"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/WuLiFang/csheet/v6/pkg/api"
	"github.com/tidwall/gjson"
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

const fragmentTypesQuery = `
{
	__schema {
	  types {
		kind
		name
		possibleTypes {
		  name
		}
	  }
	}
}
`

func main() {
	server := httptest.NewServer(handler.NewDefaultServer(api.NewExecutableSchema()))
	defer server.Close()
	client := server.Client()

	// schema.json
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
	j := gjson.ParseBytes(data)
	err = ioutil.WriteFile("schema.json", []byte(j.Get("data").Raw), 0644)
	if err != nil {
		panic(err)
	}

	// fragment-types.json
	data, err = json.Marshal(map[string]interface{}{"query": fragmentTypesQuery})
	if err != nil {
		panic(err)
	}
	resp, err = client.Post(server.URL, "application/json", bytes.NewReader(data))
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()
	data, err = ioutil.ReadAll(resp.Body)
	if err != nil {
		panic(err)
	}
	res := gjson.ParseBytes(data)
	var types = []interface{}{}
	res.Get("data.__schema.types").ForEach(func(k, v gjson.Result) bool {
		if v.Get("possibleTypes.#").Int() > 0 {
			types = append(types, v.Value())
		}
		return true
	})
	d, err := json.Marshal(map[string]interface{}{
		"__schema": map[string]interface{}{
			"types": types,
		},
	})
	if err != nil {
		panic(err)
	}
	err = ioutil.WriteFile("fragment-types.json", d, 0644)
	if err != nil {
		panic(err)
	}
}
