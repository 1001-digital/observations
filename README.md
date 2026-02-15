```
-------------------------------------
|                                   |
|     ·  ·  ·  ·  ·  ·  ●  ·  ·     |
|     ·  ·  ·  ·  ·  ·  ·  ·  ·     |
|     ·  ●  ·  ·  ·  ·  ·  ·  ·     |
|     ·  ·  ·  ·  ●  ·  ·  ·  ·     |
|     ·  ·  ·  ·  ·  ·  ·  ·  ●     |
|     ·  ·  ●  ·  ·  ·  ·  ·  ·     |
|     ·  ·  ·  ·  ·  ·  ·  ●  ·     |
|     ·  ●  ·  ·  ·  ●  ·  ·  ·     |
|     ·  ·  ·  ●  ·  ·  ·  ·  ·     |
|                                   |
-------------------------------------
```

# Observations

Leave observations on any ERC-721 or ERC-1155 artifact.

Observations is a minimal, permissionless protocol for annotating NFTs. Anyone can leave a text observation on any token — optionally pinned to specific coordinates on the artifact itself. All observations are emitted as events, making them free to write and easy to index.

Inspired by [Sam Spratt's *The Monument Game*](https://samspratt.com/).

## Contract

The core of the protocol is a single Solidity contract: [`Observations.sol`](packages/contract/contracts/Observations.sol).

### `observe`

Leave a text observation on a token.

```solidity
function observe(
    address collection,
    uint256 tokenId,
    uint64 parent,
    bool update,
    string calldata note,
    uint8 viewType,
    uint32 time
) external payable
```

### `observeAt`

Leave an observation pinned to a specific location on the artifact.

```solidity
function observeAt(
    address collection,
    uint256 tokenId,
    uint64 parent,
    bool update,
    string calldata note,
    int32 x,
    int32 y,
    uint8 viewType,
    uint32 time
) external payable
```

### Events

Every observation emits a single event:

```solidity
event Observation(
    address indexed collection,
    uint256 indexed tokenId,
    address indexed observer,
    uint64 id,
    uint64 parent,
    bool update,
    string note,
    bool located,
    int32 x,
    int32 y,
    uint8 viewType,
    uint32 time,
    uint256 tip
)
```

The `collection` and `tokenId` are indexed, so you can efficiently filter observations for a specific artifact. The `observer` is also indexed, so you can query all observations left by a given address. Each observation gets a sequential `id` scoped to the artifact. `parent` references an existing observation for threading (0 = top-level). `update=true` signals an edit or deletion (empty note = deletion).

### State

The contract tracks a lightweight `Artifact` record per token:

```solidity
struct Artifact {
    uint64 count;       // total number of observations
    uint128 firstBlock; // block of the first observation
}
```

Readable via:

```solidity
mapping(address => mapping(uint256 => Artifact)) public artifacts;
```

This is the only on-chain state. Observation content lives in event logs.

## Packages

This is a monorepo managed with [pnpm workspaces](https://pnpm.io/workspaces).

| Package | Description | Status |
|---|---|---|
| [`packages/contract`](packages/contract) | Solidity contract, tests, and deployment | Ready |
| [`packages/indexer`](packages/indexer) | Ponder-based indexer for all observations | In progress |
| [`packages/ui`](packages/ui) | UI components for creating and viewing observations | In progress |

### Contract

Built with [Hardhat 3](https://hardhat.org/) and [viem](https://viem.sh/).

```shell
cd packages/contract
npx hardhat test
```

### Indexer

A [Ponder](https://ponder.sh/) indexer that watches for `Observation` events and stores them in a queryable database with a GraphQL API.

### UI

A [Nuxt](https://nuxt.com/) app providing embeddable components for hosting observation interfaces — create observations, browse observations on a given artifact, and view observation locations on token media.

## Setup

```shell
pnpm install
```

## License

[MIT](LICENSE)
