# yjs-schema-bench

## Running the tests/benchmarks

1. `$ npm install`
2. `$ npm run test`

## Element schema

This benchmark evaluates the performance of various schemas when handling updates to attributes in a Yjs document. The implementations tested include:

1. **Nested Map**: A nested map of attributes, representing the current setup in the repository. This approach uses a `Y.Map` structure for attributes and deeply nests data within the map.

2. **Key Value Attribute Map**: An implementation using `YKeyValue` from the `y-utilities` package. This schema is optimized for key-value storage but uses a different structure than the nested map.

3. **Array as Attribute Value in Map**: A custom implementation of `YKeyValue`, where a `Y.Array` is stored in the map of each element. This aims to optimize attribute storage by leveraging arrays for specific use cases.

4. **Array as Attribute Value on Root**: Another custom implementation of `YKeyValue`, where a `Y.Array` is stored in the root of the document for each element. This minimizes nesting and centralizes array storage for improved performance in certain operations.

### Results

| Schema                           | Stage   | Doc Size (v1) | Doc Size (v2) | Doc Size (JSON) |
| -------------------------------- | ------- | ------------- | ------------- | --------------- |
| Nested Map                       | Insert  | 110.26 KB     | 84.02 KB      | 71.31 KB        |
|                                  | Updated | 19.17 MB      | 87.74 KB      | 71.10 KB        |
| Key Value Attribute Map          | Insert  | 114.24 KB     | 110.39 KB     | 107.44 KB       |
|                                  | Updated | 9.64 MB       | 112.14 KB     | 107.21 KB       |
| Array as Attribute Value in Map  | Insert  | 106.38 KB     | 92.80 KB      | 75.21 KB        |
|                                  | Updated | 9.64 MB       | 94.58 KB      | 75.01 KB        |
| Array as Attribute Value on Root | Insert  | 92.75 KB      | 88.90 KB      | 78.14 KB        |
|                                  | Updated | 9.62 MB       | 90.69 KB      | 77.95 KB        |


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