# Changelog

## [1.1.0] - 2025-10-03

### Deprecated

- `generatePath` is now deprecated on the main route object.  
  (It’s still available for backwards compatibility, but will be removed in a future major release.)

### Added

- `generatePath` is now exported directly, so it can be imported and used where needed.

## [1.2.0] — GeneratePath Refactor and Improvements

### 🔄 Breaking Changes

- **Removed** `generatePath` from route objects.  
  Use the standalone function instead:

  ```ts
  import { generatePath } from "easy-route-management";
  ```

- **changed** `generatePath` now accpets route object instead path string

  ```ts
  import { generatePath } from "easy-route-management";
  generatePath(routes.user.bySection, { userId: "123", section: "section1" });
  ```

### Improvements

- Correctly infers `acceptedPathValues` when using `generatePath()`.
- Adds runtime validation for invalid route objects.
- Automatically URL-encodes parameter values using encodeURIComponent.

## [1.3.0] — Dual ESM + CJS Build Support

### ✨ Added

- Dual build setup (ESM + CommonJS) for better compatibility across Node and frontend environments.

### 🧰 Improved

- `require("easy-route-management")` now returns the function directly.
- `import createRoutePaths` remains unchanged for ESM users.

## [1.4.0] — Add `.relative()` method

### ✨ Added

- New `.relative()` method to obtain route paths relative to the current node.  
  Useful for frameworks like React Router or Angular that require nested relative paths.

  ```ts
  routes.user.settings.path                   // => "/user/settings"
  routes.user.settings.relative().path        // => "/settings"
  routes.user.settings.relative().byId.path   // => "/settings/:id"
  ```

### [1.4.1]

**Docs**

- Updated README with improved `.relative()` examples and descriptions.
