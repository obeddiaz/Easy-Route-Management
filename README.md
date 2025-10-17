# Easy Route Management

**A simple, type-safe way to manage and generate nested routes.**

Managing routes manually can quickly become cumbersome as your app grows. Easy Route Management allows you to define your routes in a nested object and automatically generate paths with parameters, reducing errors and making refactoring easier. It works with **React Router, Express, Angular, or any library that uses paths**.

---

## Features

- ✅ Define nested routes in a single object.
- 🔄 Automatically generate paths with dynamic parameters.
- 🧠 Type-safe: ensures only valid routes and parameters are used.
- 🚫 Prevents access to undefined routes.
- ⚙️ Works with any framework or library that uses paths.
- 🔒 Automatically URL-encodes parameter values.

---

## Installation

```bash
npm install easy-route-management
# or
yarn add easy-route-management
```

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

### 🧩 Accepted Path Values

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

### Quick Example

```ts
const postId = "123";
// Before: Hardcoding paths
navigate(`/posts/${postId}`);

// After: Type-safe and dynamic
import { generatePath } from "easy-route-management";

navigate(generatePath(appRoutes.posts.byId, { postId }));
```

### 🧠 IntelliSense Preview

Here's how route generation looks in VS Code with full type safety:

![Intellisense Preview](https://github.com/obeddiaz/Easy-Route-Management/raw/master/assets/intellisense-example.png "Preview")

### 🧭 Examples by Framework

### React Router

```tsx
<Route path={appRoutes.user.path} />
<Route path={appRoutes.user.settings.path} />
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

### 🧠 Type Safety Highlights

- **Inferred parameter types:** TypeScript automatically infers required params.
- **Compile-time safety:** Accessing invalid routes or missing params triggers TypeScript errors.
- **Optional parameters:** Paths ending with ? are inferred as optional automatically.

```ts
generatePath(routes.posts.byId, {}); // ❌ Missing "postId"
generatePath(routes.posts.byId, { postId: "123" }); // ✅
```

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

---

## ⚠️ Known Limitations

- Reusing the same parameter name across nested routes (e.g., `:id` in both parent and child routes)
  currently produces duplicate segments such as `/post/:id/:id`.

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

---

## 🧾 Changelog Summary (v1.2.0)

- **Breaking changes:**
  - Removed `generatePath` from route objects.
  - Use the standalone `generatePath(routeObject, params)` instead.
- **Improvements:**
  - `generatePath()` now accepts the route object directly.
  - Automatically infers types from `acceptedPathValues`.
  - Parameters are now URL-encoded with `encodeURIComponent`.
  - Runtime validation for invalid route objects.

## 🧾 Changelog Summary (v1.3.0)

- Added full support for both `import` and `require`.
- Fixed issue where `require("easy-route-management")` returned an object instead of the main function.
- No API changes — existing imports continue to work.

---

## 📬 Feedback

Have ideas, questions, or suggestions?  
Feel free to [start a discussion](https://github.com/obeddiaz/Easy-Route-Management/discussions) or [open an issue](https://github.com/obeddiaz/Easy-Route-Management/issues) on GitHub.  
Your feedback helps me to improve Easy Route Management for everyone!

## 🔗 GitHub Repository

You can find the source code, report issues, or contribute here:
[Repository](https://github.com/obeddiaz/Easy-Route-Management)
