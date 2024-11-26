# yjs-schema-bench

## Running the tests/benchmarks

1. `$ npm install`
2. `$ npm run test`

## Element schema

This benchmark evaluates the performance of various schemas when handling updates to attributes in a Yjs document. The implementations tested include:

1. **Nested Map**:  
   The current implementation in the repository. Attributes are stored in a deeply nested `Y.Map` structure within each element.

2. **Key Value Attribute Map**:  
   An implementation using the `YKeyValue` structure from the `y-utilities` package. Attributes are stored as key-value pairs outside of the main element map.

3. **Array as Attribute Value in Map**:  
   A custom implementation where a `Y.Array` is used to store attributes directly inside each element's map.

4. **Array as Attribute Value on Root**:  
   A custom implementation where a `Y.Array` is used to store attributes, but the arrays are stored at the root of the document instead of inside individual element maps.

5. **YXmlElement Nested**:  
   Attributes and elements are represented as a deeply nested `Y.XmlElement`, where attributes are directly tied to the corresponding XML elements.

6. **YXmlElement on Root**:  
   Similar to the nested implementation, but attributes are stored in a flattened structure at the root of the document, reducing the nesting complexity of the XML representation.

### Results

| Schema                          | Stage   | Doc Size (v1) | Doc Size (v2) | Doc Size (JSON) |
|---------------------------------|---------|---------------|---------------|-----------------|
| Nested Map                      | Insert  | 110.26 KB     | 84.02 KB      | 71.31 KB        |
|                                 | Updated | 19.17 MB      | 87.75 KB      | 71.11 KB        |
| Key Value Attribute Map         | Insert  | 114.24 KB     | 110.39 KB     | 107.44 KB       |
|                                 | Updated | 9.64 MB       | 112.15 KB     | 107.22 KB       |
| Array as Attribute Value in Map | Insert  | 106.38 KB     | 92.80 KB      | 75.21 KB        |
|                                 | Updated | 9.64 MB       | 94.58 KB      | 75.01 KB        |
| Array as Attribute Value on Root| Insert  | 92.75 KB      | 88.90 KB      | 78.14 KB        |
|                                 | Updated | 9.62 MB       | 90.68 KB      | 77.94 KB        |
| YXmlElement Nested              | Insert  | 80.95 KB      | 49.86 KB      | 58.64 KB        |
|                                 | Updated | 19.14 MB      | 55.53 KB      | 58.43 KB        |
| YXmlElement on Root             | Insert  | 45.91 KB      | 40.07 KB      | 52.74 KB        |
|                                 | Updated | 19.10 MB      | 39.90 KB      | 52.54 KB        |

### Schema examples

#### Nested Map

```json
{
  "elementSchema": {
    "u205vEIP": {"tagName": "div", "attributes": {"width": "100", "height": "200"}},
    "VCWK0HH5": {"tagName": "div", "attributes": {"width": "100", "height": "200"}},
    "MdLTVhKA": {"tagName": "div", "attributes": {"width": "100", "height": "200"}},
    "WCCadkdT": {"tagName": "div", "attributes": {"width": "100", "height": "200"}},
    "adSHLH3i": {"tagName": "div", "attributes": {"width": "100", "height": "200"}}
  }
}
```

#### Key Value Attribute Map

```json
{
  "elementSchema": {
    "MvLSWz65": {"tagName": "div"},
    "AF8ZAL4p": {"tagName": "div"},
    "KqGrJFC5": {"tagName": "div"},
    "XKqlanUM": {"tagName": "div"},
    "UhAAHtVe": {"tagName": "div"}
  },
  "MvLSWz65-attributes": [{"key": "width", "val": "100"}, {"key": "height", "val": "200"}],
  "AF8ZAL4p-attributes": [{"key": "width", "val": "100"}, {"key": "height", "val": "200"}],
  "KqGrJFC5-attributes": [{"key": "width", "val": "100"}, {"key": "height", "val": "200"}],
  "XKqlanUM-attributes": [{"key": "width", "val": "100"}, {"key": "height", "val": "200"}],
  "UhAAHtVe-attributes": [{"key": "width", "val": "100"}, {"key": "height", "val": "200"}]
}
```

#### Array as Attribute Value in Map

```json
{
  "elementSchema": {
    "wDN0xu8q": {"tagName": "div", "attributes": [["width", "100"], ["height", "200"]]},
    "HVlTLjxV": {"tagName": "div", "attributes": [["width", "100"], ["height", "200"]]},
    "aNmDbwFr": {"tagName": "div", "attributes": [["width", "100"], ["height", "200"]]},
    "mRHiVCRp": {"tagName": "div", "attributes": [["width", "100"], ["height", "200"]]},
    "kHt3sRIT": {"tagName": "div", "attributes": [["width", "100"], ["height", "200"]]}
  }
}
```

#### Array as Attribute Value on Root

```json
{
  "elementSchema": {
    "nXOmhIPC": {"tagName": "div"},
    "pa1DWs8H": {"tagName": "div"},
    "UWtP6jaq": {"tagName": "div"},
    "mMN9XHL0": {"tagName": "div"},
    "FFLpkPxg": {"tagName": "div"}
  },
  "nXOmhIPC-attr": [["width", "100"], ["height", "200"]],
  "pa1DWs8H-attr": [["width", "100"], ["height", "200"]],
  "UWtP6jaq-attr": [["width", "100"], ["height", "200"]],
  "mMN9XHL0-attr": [["width", "100"], ["height", "200"]],
  "FFLpkPxg-attr": [["width", "100"], ["height", "200"]]
}
```

#### YXmlElement Nested

```json
{
  "elementSchema": "<undefined><div cml-id=\"ZzjxfE6Q\" height=\"818\" width=\"987\"></div><div cml-id=\"Jx3zs5Oz\" height=\"165\" width=\"67\"></div><div cml-id=\"hOdTAyto\" height=\"557\" width=\"638\"></div><div cml-id=\"Zir8FoCb\" height=\"267\" width=\"776\"></div><div cml-id=\"qY0rGVS4\" height=\"375\" width=\"29\"></div></undefined>"
}
```

#### YXmlElement on Root

```json
{
  "d8hIiwvv": "<div height=\"780\" width=\"651\"></div>",
  "wIVtdhEd": "<div height=\"76\" width=\"955\"></div>",
  "XGWopwyb": "<div height=\"758\" width=\"812\"></div>",
  "fEPgoRO6": "<div height=\"196\" width=\"181\"></div>",
  "XChU5QYR": "<div height=\"298\" width=\"213\"></div>"
}
```