# dbug-js

<!-- automd:badges color=yellow -->

[![npm version](https://img.shields.io/npm/v/dbug-js?color=yellow)](https://npmjs.com/package/dbug-js)
[![npm downloads](https://img.shields.io/npm/dm/dbug-js?color=yellow)](https://npm.chart.dev/dbug-js)

<!-- /automd -->

The official TypeScript/JavaScript agent for [dbug desktop](https://github.com/dbugapp/desktop). Use this package in your TypeScript projects to send debug data to the dbug desktop app for advanced inspection and visualization.

## Features

- 🚀 Send multiple payloads in a single call
- 🔧 Configurable endpoint
- 🛡️ Safe serialization of complex objects (functions, circular references, Vue refs)
- ⚡ Non-blocking with timeout protection
- 🖥️ Official TypeScript agent for [dbug desktop](https://github.com/dbugapp/desktop)

## Installation

### npm

```sh
npm install dbug-js
```

### yarn

```sh
yarn add dbug-js
```

### pnpm

```sh
pnpm add dbug-js
```

### Auto-detect package manager

```sh
npx nypm install dbug-js
```

## Setup

**Required**: This package only works with the [dbug desktop app](https://github.com/dbugapp/desktop).

1. **Install the Desktop App**: Download and run the [dbug desktop app](https://github.com/dbugapp/desktop)
2. **Install this Agent**: Use any of the installation methods above
3. **Start Debugging**: Import and use `dbug` in your TypeScript/JavaScript code

## Usage

### Basic Usage

```js
import dbug from "dbug-js";

// Send single payload
dbug({ message: "Hello world", data: [1, 2, 3] });

// Send multiple payloads at once
dbug({ user: "john", age: 30 }, ["item1", "item2"], "simple string", {
  complex: { nested: { object: true } },
});
```

### Custom Endpoint

```js
import dbug from "dbug-js";

// Set custom endpoint (optional - defaults to http://127.0.0.1:53821/)
dbug.endpoint("http://localhost:3000/debug");

// Now all dbug calls will use the custom endpoint
dbug({ message: "Using custom endpoint" });
```

### Advanced Object Serialization

The library handles complex JavaScript objects that normally can't be JSON serialized:

```js
// Functions
dbug({
  myFunction: function namedFunction() {
    return "Hello";
  },
});

// Circular references
const obj = { name: "test" };
obj.self = obj;
dbug(obj); // Won't crash - circular refs are handled

// Vue refs (if using Vue.js)
import { ref } from "vue";
const myRef = ref("Hello Vue");
dbug(myRef); // Properly serializes Vue reactivity
```

## CDN Usage

**ESM** (Node.js, Bun, Deno)

```js
import dbug from "dbug-js";
```

**CDN** (Deno, Bun and Browsers)

```js
import dbug from "https://esm.sh/dbug-js";
```

## Desktop App Requirement

This package is the official TypeScript/JavaScript agent for [dbug desktop](https://github.com/dbugapp/desktop) and requires the desktop app to function:

1. **Download and install** the [dbug desktop app](https://github.com/dbugapp/desktop)
2. **Run the desktop app** (it will listen on `http://127.0.0.1:53821/` by default)
3. **Use `dbug()`** in your TypeScript/JavaScript code
4. **See your debug data** visualized in real-time in the desktop app

**Note**: If the desktop app isn't running, `dbug()` calls will fail silently with a helpful console error message.

## API Reference

### `dbug(...payloads)`

Sends one or more payloads to the debug endpoint.

- **Parameters**: `...payloads: unknown[]` - Any number of values to debug
- **Returns**: `Promise<void>`

### `dbug.endpoint(url)`

Sets a custom endpoint for debug requests.

- **Parameters**: `url: string` - The endpoint URL
- **Default**: `http://127.0.0.1:53821/`

## Development

<details>

<summary>local development</summary>

- Clone this repository
- Install latest LTS version of [Node.js](https://nodejs.org/en/)
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable`
- Install dependencies using `pnpm install`
- Run interactive tests using `pnpm dev`

</details>

## License

<!-- automd:contributors license=MIT -->

Published under the [MIT](https://github.com/dbugapp/dbug-js/blob/main/LICENSE) license.
Made by [community](https://github.com/dbugapp/dbug-js/graphs/contributors) 💛
<br><br>
<a href="https://github.com/dbugapp/dbug-js/graphs/contributors">
<img src="https://contrib.rocks/image?repo=dbugapp/dbug-js" />
</a>

<!-- /automd -->

<!-- automd:with-automd -->

---

_🤖 auto updated with [automd](https://automd.unjs.io)_

<!-- /automd -->
