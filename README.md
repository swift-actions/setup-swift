# Setup Swift
<p>
  <a href="https://github.com/features/actions">
    <img src="https://img.shields.io/badge/GitHub-Action-blue?logo=github" alt="GitHub Action" />
  </a>
  <a href="https://help.github.com/en/actions/automating-your-workflow-with-github-actions/virtual-environments-for-github-hosted-runners#supported-runners-and-hardware-resources">
    <img src="https://img.shields.io/badge/platform-macOS%20%7C%20Ubuntu%20%7C%20Windows-lightgray" alt="Supports macOS, Ubuntu & Windows" />
  </a>
  <a href="https://swift.org">
    <img src="https://img.shields.io/badge/Swift-6.0.2-F05138?logo=swift&logoColor=white" alt="Swift 6.1.0" />
  </a>
  <a href="https://github.com/swift-actions/setup-swift/releases/latest">
    <img src="https://img.shields.io/github/v/release/swift-actions/setup-swift?sort=semver" alt="Latest release" />
  </a>
</p>

[GitHub Action](https://github.com/features/actions) that will setup a [Swift](https://swift.org) environment with a specific version. Works on both Ubuntu and macOS runners.

> [!IMPORTANT]
> 3.0 is coming, powered by Swiftly 🚀 - follow progress on https://github.com/swift-actions/setup-swift/pull/710

> [!IMPORTANT]
> Experimental support for Swift 6.2. To install Swift 6.2, use the option to install a specific version. The default version is still 6.1.

## Usage

To run the action with the latest swift version available, simply add the action as a step in your workflow:

```yaml
- uses: swift-actions/setup-swift@v2
```

After the environment is configured you can run swift commands using the standard [`run`](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/workflow-syntax-for-github-actions#jobsjob_idstepsrun) step:
```yaml
- uses: swift-actions/setup-swift@v2
- name: Get swift version
  run: swift --version # Swift 6.1.0
```

A specific Swift version can be set using the `swift-version` input:

```yaml
- uses: swift-actions/setup-swift@v2
  with:
    swift-version: "6.2.0"
- name: Get swift version
  run: swift --version # Swift 6.2.0
```

Works perfect together with matrixes: 

```yaml
name: Swift ${{ matrix.swift }} on ${{ matrix.os }}
runs-on: ${{ matrix.os }}
strategy:
  matrix:
    os: [ubuntu-latest, macos-latest]
    swift: ["5.4.3", "5.2.4"]
steps:
- uses: swift-actions/setup-swift@v2
  with:
    swift-version: ${{ matrix.swift }}
- name: Get swift version
  run: swift --version
```

## Note about versions

This project uses strict semantic versioning to determine what version of Swift to configure. This differs slightly from the official convention used by Swift.

For example, Swift is available as version `5.1` but using this as value for `swift-version` will be interpreted as a version _range_ of `5.1.X` where `X` is the latest patch version available for that major and minor version.


In other words specifying...
- `"5.1.0"` will resolve to version `5.1`
- `"5.1"` will resolve to latest patch version (aka `5.1.1`)
- `"5"` will resolve to latest minor and patch version (aka `5.10`)

### Caveats

YAML interprets eg. `5.0` as a float, this action will then interpret that as `5` which will result in eg. Swift 5.5 being resolved. Quote your inputs! Thus:

```
- uses: swift-actions/setup-swift@v2
  with:
    swift-version: '5.0'
```

Not:

```
- uses: swift-actions/setup-swift@v2
  with:
    swift-version: 5.0
```

## Keeping the action up-to-date

You have two options for keeping this action up-to-date: either you define a specific version (like `v2.0.1`) or use the major version tag (like `v2`).

### Specific version

We recommend using the specific version tag together with [Dependabot](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/about-dependabot-version-updates) to keep the action up-to-date. That way you will automatically get notifed when the action updates and you can read the changelog directly in the PR opened by dependabot.

### Major version tag

If you don't plan on keeping tabs on updates or don't want to use Dependabot but still would like to always use the latest version, you can use the main version tag.

## Legal
Uses MIT license. 
The Swift logo is a trademark of Apple Inc.
