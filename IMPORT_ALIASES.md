# Import Aliases in Node.js Project

This project uses Node.js import aliases to make imports cleaner and more maintainable.

## Configuration

The import aliases are configured in two places:

### 1. `tsconfig.json`

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "#src/*": ["./src/*"]
    }
  }
}
```

### 2. `package.json`

```json
{
  "imports": {
    "#src/*": {
      "default": "./src/*"
    }
  }
}
```

## Usage

Instead of using relative paths like:

```typescript
import { something } from "../../../some/deep/path";
```

You can use the `#src` alias:

```typescript
import { something } from "#src/some/deep/path";
```

### Benefits

- **Cleaner imports**: No more `../../../` chains
- **Easier refactoring**: Moving files doesn't break imports
- **Better readability**: Clear indication of where imports come from
- **Consistent with Node.js standards**: Uses the recommended Node.js approach for import aliases

## Examples

```typescript
// Before
import { logger } from "./config/logger";
import { server } from "./app";

// After
import { logger } from "#src/config/logger";
import { server } from "#src/app";
```

## Notes

- This approach uses Node.js native import maps (introduced in Node.js 12+)
- TypeScript paths are configured to match the Node.js import maps
- The `#` prefix is a convention for Node.js import aliases
