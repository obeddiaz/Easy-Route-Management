# Easy Route Management

**A simple, type-safe way to manage and generate nested routes.**

Managing routes manually can quickly become cumbersome as your app grows. Easy Route Management allows you to define your routes in a nested object and automatically generate paths with parameters, reducing errors and making refactoring easier. It works with **React Router, Express, Angular, or any library that uses paths**.

## Features

- ✅ Define nested routes in a single object.
- 🔄 Automatically generate paths with dynamic parameters.
- 🧠 Type-safe: ensures only valid routes and parameters are used.
- 🛡️ (**NEW**) **Compile-time duplicate route detection** using `defineRoutes`.
- 🚫 Prevents access to undefined routes.
- ⚙️ Works with any framework or library that uses paths.
- 🔒 Automatically URL-encodes parameter values.
- 🧭 Easily get relative to parent paths using `.relative()` method
- ⚙️ Control whether generated paths start with `/` using the `includeLeadingSlash` option.

## 📖 Table of Contents

- [Installation](#installation)
- [Demos](#demos)
- [Usage](#usage)
- [Global Option: includeLeadingSlash](#global-option-includeleadingslash)
- [New: .relative()](#-new-relative)
- [Accepted Path Values](#-accepted-path-values)
- [Quick Example](#quick-example)
- [Examples by Framework](#-examples-by-framework)
- [Type Safety Highlights](#-type-safety-highlights)
- [Compile-Time Duplicate Route Detection (defineRoutes)](#-compile-time-duplicate-route-detection-defineroutes)
- [Extended Examples](#extended-examples)
- [Known Limitations](#️-known-limitations)
- [Common Issues / FAQ](#-common-issues--faq)
- [Changelog Summary](#-changelog-summary)
- [Feedback](#-feedback)

## Installation

```bash
npm install easy-route-management
# or
yarn add easy-route-management
```

## Demos

[React Router Demo](https://codesandbox.io/p/sandbox/easy-route-management-jwy645)

[Express Demo](https://codesandbox.io/p/devbox/eager-jennings-ctx37t)

## Usage

```ts
import createRoutePaths, { RouteObjInterface, generatePath } from "easy-route-management";

const routesObj = {
  user: {
    path: "user",
    subRoutes: {
      settings: {
        path: "settings",
      },
    },
  },
  posts: {
    path: "posts",
    subRoutes: {
      byId: {
        path: ":postId",
      },
    },
  },
} as const satisfies RouteObjInterface;

const appRoutes = createRoutePaths(routesObj);

// Example usage:
appRoutes.posts.path
// => "/posts"
appRoutes.posts.byId.path
// => "/posts/:postId"
generatePath(appRoutes.posts.byId, { postId: "123" });
// => "/posts/123"

appRoutes.user.settings.path
// => "/user/settings"
```

## Global Option: includeLeadingSlash

By default, all generated paths start with a leading `/`.
You can disable this globally by setting the `includeLeadingSlash` option to `false`.
This is useful for frameworks like Angular, where routes are relative by default.

```ts
const appRoutes = createRoutePaths(routesObj, { includeLeadingSlash: false });

appRoutes.user.settings.path;
// => "user/settings"

appRoutes.posts.byId.path;
// => "posts/:postId"
```

## 🧭 New: .relative()

The .relative() method returns a new route object starting from the current level, ignoring any parent path segments.
This is especially useful for frameworks like React Router or Angular, where nested routes already inherit their parent’s path.

```ts
const routesObj = {
  user: {
    path: "user",
    subRoutes: {
      settings: {
        path: "settings",
        subRoutes: {
          byId: { path: ":settingId" },
        },
      },
    },
  },
} as const satisfies RouteObjInterface;

const routes = createRoutePaths(routesObj);

routes.user.settings.path
// => "/user/settings"

routes.user.settings.relative().path
// => "/settings"

routes.user.settings.relative().byId.path
// => "/settings/:settingId"
```

### Overriding the Leading Slash

The `.relative()` method supports an optional parameter that overrides the global includeLeadingSlash setting for that call.

```ts
const routes = createRoutePaths(routesObj, { includeLeadingSlash: false });

routes.user.settings.relative().byId.path;
// => "settings/:settingId"

routes.user.settings.relative(true).byId.path;
// => "/settings/:settingId"
```

### Using with generatePath

```ts
import { generatePath } from "easy-route-management";

const path = generatePath(
  routes.user.settings.relative().byId,
  { settingId: "1234" },
);

console.log(path);
// => "/settings/1234"
```

## 🧩 Accepted Path Values

You can define a list of accepted values for dynamic segments using acceptedPathValues.
This gives you stricter type safety and better IntelliSense.

```ts
const routesObj = {
  user: {
    path: "user/:userId",
    subRoutes: {
      bySection: {
        path: ":section",
        acceptedPathValues: {
          section: ["overview", "settings", "activity"],
        },
      },
    },
  },
} as const satisfies RouteObjInterface;

const routes = createRoutePaths(routesObj);

// ✅ Correct usage
generatePath(routes.user.bySection, { userId: "42", section: "overview" });

// ❌ TypeScript error — "profile" is not an accepted value
generatePath(routes.user.bySection, { userId: "42", section: "profile" });
```

For non-TypeScript users, invalid `acceptedPathValues` will not throw an error at runtime.
These restrictions are meant primarily for TypeScript compile-time safety.

## Quick Example

```ts
const postId = "123";
// Before: Hardcoding paths
navigate(`/posts/${postId}`);

// After: Type-safe and dynamic
import { generatePath } from "easy-route-management";

navigate(generatePath(appRoutes.posts.byId, { postId }));
```

## 🧠 IntelliSense Preview

Here's how route generation looks in VS Code with full type safety:

![Intellisense Preview](https://github.com/obeddiaz/Easy-Route-Management/raw/master/assets/intellisense-example.png "Preview")

## 🧭 Examples by Framework

### React Router

```tsx
<Route path={appRoutes.user.path}>
  <Route path={appRoutes.user.settings.relative().path} />
<Route>
<Route path={appRoutes.posts.path} />
<Route path={appRoutes.posts.byId.path} />
```

### React Navigation Example

```tsx
import { generatePath } from "easy-route-management";

navigate(appRoutes.user.path); // '/user'
navigate(generatePath(appRoutes.posts.byId, { postId: "123" })); // '/posts/123'
```

### Express.js Examples

```ts
import express from "express";
import createRoutePaths from "easy-route-management";

const routesObj = {
  user: {
    path: "user",
    subRoutes: {
      settings: {
        path: "settings",
      },
    },
  },
  posts: {
    path: "posts",
    subRoutes: {
      byId: {
        path: ":postId",
      },
    },
  },
};

const appRoutes = createRoutePaths(routesObj);
const app = express();

app.get(appRoutes.user.path, (req, res) => {
  res.send("User Home");
});

app.get(appRoutes.user.settings.path, (req, res) => {
  res.send("User Settings");
});

app.get(appRoutes.posts.path, (req, res) => {
  res.send("Posts List");
});

app.get(appRoutes.posts.byId.path, (req, res) => {
  const { postId } = req.params;
  res.send(`Post Details for ID: ${postId}`);
});
```

## 🧠 Type Safety Highlights

- **Inferred parameter types:** TypeScript automatically infers required params.
- **Compile-time safety:** Accessing invalid routes or missing params triggers TypeScript errors.
- **Optional parameters:** Paths ending with ? are inferred as optional automatically.

```ts
generatePath(routes.posts.byId, {}); // ❌ Missing "postId"
generatePath(routes.posts.byId, { postId: "123" }); // ✅
```

### 🧱 Compile-Time Duplicate Route Detection (`defineRoutes`)

In addition to generating and working with nested routes, you can use the defineRoutes helper to validate your routing structure at compile time, ensuring that no two routes resolve to the same pattern.

This is useful when two routes look different but compile to the same shape, such as:
- `/home/:id`
- `/home/:homeId`

Both resolve to `/home/:param`, so defineRoutes will catch the conflict before your app runs.

#### Example

```ts
const routes = defineRoutes({
  home: {
    path: "home/:id",
  },
  public: {
    // ❌ TypeScript Error:
    //    Duplicate route shape detected: "/home/:param"
    path: "home/:homeId",
  },
});
```

#### Key Points

- Prevents ambiguous routing patterns
- Works only at compile time — zero runtime cost
- Your route object remains unchanged

## Extended Examples

```ts
import { generatePath } from "easy-route-management";

const routesObj = {
  dashboard: {
    path: "dashboard",
    subRoutes: {
      analytics: {
        path: "analytics",
        subRoutes: {
          byDate: {
            path: ":date",
          },
        },
      },
    },
  },
};

const appRoutes = createRoutePaths(routesObj);

navigate(
  generatePath(appRoutes.dashboard.analytics.byDate, { date: "2025-10-01" }),
);
// Result: "/dashboard/analytics/2025-10-01"
```

### Error handling

```ts
// Missing parameter
navigate(generatePath(appRoutes.dashboard.analytics.byDate, {})); // ❌ TypeScript error

// Accessing undefined route
navigate(appRoutes.dashboard.reports.path); // ❌ Property 'reports' does not exist
```

### Extracting Route Parameter Types

```ts
const routesObj = {
  dashboard: {
    path: "dashboard",
    subRoutes: {
      analytics: {
        path: "analytics",
        subRoutes: {
          byDate: { path: ":date" },
        },
      },
    },
  },
};

const appRoutes = createRoutePaths(routesObj);

// Extract type of route params
type AnalyticsRouteParams =
  typeof appRoutes.dashboard.analytics.byDate._routeParams;
// -> { date: string; }
```

## ⚠️ Known Limitations

### Reusing same parameter name

Reusing the same parameter name across nested routes (e.g., `:id` in both parent and child routes) currently produces duplicate segments such as `/post/:id/:id`.

```ts
const routesObj = {
  post: {
    path: "post/:id",
    subRoutes: {
      byId: { path: ":id" },
    },
  },
};
// Result: '/post/:id/:id'
```

Workaround: use unique parameter names in nested routes (e.g., `:postId`, `:commentId`).
These limitations will be addressed in a future update.

### Optional parameters followed by child routes

When defining routes, optional parameters (`:param?`) cannot be followed by other segments — whether those segments are dynamic or static (like `"comments"`, `"sub-route"` or `":commentId"`).

This is a limitation inherited from how most routing frameworks (React Router, Express, etc.) interpret paths:
if an optional segment appears before another segment, it becomes impossible to determine whether that segment is part of the optional value or part of the next route.

```ts
const routesObj = {
  post: {
    path: "post/:postId?",
    subRoutes: {
      comments: { path: "comments" },
      anotherSubRoute: { path: "sub-route" },
    },
  },
};

const appRoutes = createRoutePaths(routesObj);
// Resulting paths: "/post/:postId?/comments", "/post/:postId?/sub-route"
// ❌ Invalid — may generate paths like "/post//comments" or "/post//sub-route"
```

#### Why

If `postId` is optional, generatePath might replace it with an empty string when omitted, resulting in a double slash (`//`) between route parts — for example, `/post//comments`.
Most routers interpret this as an invalid or ambiguous route.

#### ✅ Correct approach

Move the optional parameter to the end of the route, make it required by removing `?`, or separate the routes explicitly.

```ts
const routesObj = {
  post: {
    path: "post/:postId",
    subRoutes: {
      comments: { path: "comments/:commentId?" },
    },
  },
};

const appRoutes = createRoutePaths(routesObj);
// Resulting Paths:
// => "/post/:postId"
// => "/post/comments/:commentId?"

// When using generatePath:
generatePath(appRoutes.post, { postId: "123" })
// => "/post/123"
generatePath(appRoutes.post.comments, { postId: "123" })
// => "/post/123/comments/"
generatePath(appRoutes.post.comments, { postId: "123", commentId: "456" })
// => "/post/123/comments/456"
```

#### ✅ Summary

Optional route parameters (`:param?`) should always appear at the end of a path definition.
Never place additional segments — static or dynamic — after them.
This ensures all generated paths remain valid and unambiguous.

## ❓ Common Issues / FAQ

- Q: Why doesn’t my resulting routes object have .path or .relative()?
  - This usually happens because the routes object wasn’t declared as a constant.
    To enable full type inference and IntelliSense, make sure to use the as const assertion when defining your routes.

    ```ts
    // ❌ Without `as const`
    const routesObj = {
      user: { path: "user" },
      posts: { path: "posts" },
    };

    const routes = createRoutePaths(routesObj);
    // TypeScript cannot infer nested structure or available methods

    // ✅ With `as const`
    const routesObj = {
      user: { path: "user" },
      posts: { path: "posts" },
    } as const;

    const routes = createRoutePaths(routesObj);
    // Full IntelliSense, `.path`, `.relative()`, `.sectionPath`, and param inference work correctly
    ```

- Q: Do I need TypeScript to use this library?
  - No. It works in plain JavaScript too.
    However, if you use TypeScript, you’ll get full type inference, validation, and IntelliSense.
    The `satisfies RouteObjInterface` annotation is optional — it only helps catch structural errors when declaring your route objects.

    ```ts
    const routesObj = {
      user: { path: "user" },
    } as const satisfies RouteObjInterface;
    ```

## 🧾 Changelog Summary

### v1.2.0

- **Breaking changes:**
  - Removed `generatePath` from route objects.
  - Use the standalone `generatePath(routeObject, params)` instead.
- **Improvements:**
  - `generatePath()` now accepts the route object directly.
  - Automatically infers types from `acceptedPathValues`.
  - Parameters are now URL-encoded with `encodeURIComponent`.
  - Runtime validation for invalid route objects.

### v1.3.0

- Added full support for both `import` and `require`.
- Fixed issue where `require("easy-route-management")` returned an object instead of the main function.
- No API changes — existing imports continue to work.

### v1.4.0

- **Added**
  - New `.relative()` method to obtain route paths relative to the current node.
    Useful for frameworks like React Router or Angular that require nested relative paths.

    ```ts
    routes.user.settings.relative().path
    // "/settings"
    routes.user.settings.relative().byId.path
    // "/settings/:settingId"
    ```

### v1.5.0

- **Added**
  - `includeLeadingSlash` global option in `createRoutePaths` to control whether all generated paths begin with a `/`.  
    Useful for frameworks like Angular that expect relative (non-slash) paths.

    ```ts
    const routes = createRoutePaths(routesObj, { includeLeadingSlash: false });
    routes.user.settings.path;
    // => "user/settings"
    ```

  - `.relative()` now supports an **optional override parameter** to control the leading slash per call — allowing fine-grained path customization even when a global setting is defined.

    ```ts
    // Global config disables leading slashes
    const routes = createRoutePaths(routesObj, { includeLeadingSlash: false });

    routes.user.settings.relative().byId.path;
    // => "settings/:settingId"
    routes.user.settings.relative(true).byId.path;
    // => "/settings/:settingId"
    ```

---

### v1.5.3

- Added new optional `defineRoutes()` helper to enable compile-time detection of duplicate route patterns.
- No runtime changes or breaking API modifications.

## 📬 Feedback

Have ideas, questions, or suggestions?  
Feel free to [start a discussion](https://github.com/obeddiaz/Easy-Route-Management/discussions) or [open an issue](https://github.com/obeddiaz/Easy-Route-Management/issues) on GitHub.  
Your feedback helps me to improve Easy Route Management for everyone!

## 🔗 GitHub Repository

You can find the source code, report issues, or contribute here:
[Repository](https://github.com/obeddiaz/Easy-Route-Management)
