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
