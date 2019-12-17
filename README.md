# Setup Swift
<p>
  <img src=".github/swift.svg" height="20" alt="Swift" />
  <img src="https://img.shields.io/badge/macOS-grey" alt="macOS" />
  <img src="https://img.shields.io/badge/Ubuntu-grey" alt="Ubuntu" />
</p>

GitHub Action to setup a Swift environment with a specific version. Works on both Ubuntu and macOS environments.

## Usage

To run the action with the latest swift version available, simply add the action as a step in your workflow:

```yaml
- uses: fwal/setup-swift@master
```

A version can be provided by setting the `swift-version` input:

```yaml
- uses: fwal/setup-swift@master
  with:
    swift-version: "5.1.0"
```

Works perfect together with matrixes: 

```yaml
name: Swift ${{ matrix.swift }} on ${{ matrix.os }}
runs-on: ${{ matrix.os }}
strategy:
  matrix:
    os: [ubuntu-latest, macos-latest]
    swift: ["5.1.0", "4.2.4"]
steps:
- uses: fwal/setup-swift@master
  with:
    swift-version: ${{ matrix.swift }}
```

## Note about versions

This project uses strict semantic versioning to determine what version of Swift to configure. This differs slightly from the official convention used by Swift.

For example, Swift is available as version `5.1` but this will be interpreted as a version _range_ of `5.1.X` where `X` is the latest patch version available for that major and minor version.


In other words specifying...
- `"5.1.0"` will resolve to version `5.1`
- `"5.1"` will resolve to latest patch version (aka `5.1.1`)
- `"5"` will resolve to latest minor and patch version (aka `5.1.1`)


## Legal
Uses MIT license. 
The Swift logo is a trademark of Apple Inc.
