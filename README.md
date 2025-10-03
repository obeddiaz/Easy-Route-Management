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

---

## Installation

```bash
npm install easy-route-management
# or
yarn add easy-route-management
```

## Usage

```ts
import createRoutePaths, { RouteObjInterface } from "easy-route-management";

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
```

### 🧠 IntelliSense Preview

Here's how route generation looks in VS Code with full type safety:

![Intellisense Preview](https://github.com/obeddiaz/Easy-Route-Management/raw/master/assets/intellisense-example.png "Preview")

### Quick Example

```ts
const postId = "123";
// Before: Hardcoding paths
navigate(`/posts/${postId}`);

// After: Type-safe and dynamic
import { generatePath } from "easy-route-management";

navigate(generatePath(appRoutes.posts.byId.path, { postId }));
```

### Usage with React rotuer

```tsx
<Route path={appRoutes.user.path} />
<Route path={appRoutes.user.settings.path} />
<Route path={appRoutes.posts.path} />
<Route path={appRoutes.posts.byId.path} />
```

### Navigate

```tsx
import { generatePath } from "easy-route-management";

navigate(appRoutes.user.path); // '/user'
navigate(generatePath(appRoutes.posts.byId.path, { postId: "123" })); // '/posts/123'
```

### Type Safety

- If you forget to pass a required parameter, TypeScript will throw an error.
- If you try to access a route that doesn't exist, you'll get a compile-time error:

```ts
navigate(appRoutes.notExistingRoute.path); // ❌ Error: Property 'notExistingRoute' does not exist
```

### Express.js examples

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
```

### Use in Express Route Handlers

```ts
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
  generatePath(appRoutes.dashboard.analytics.byDate.path, { date: "2025-10-01" }),
);
// Result: '/dashboard/analytics/2025-10-01'
```

### Error handling

```ts
// Missing parameter
navigate(generatePath(appRoutes.dashboard.analytics.byDate.path, {})); // ❌ TypeScript error

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

## 📬 Feedback

Have ideas, questions, or suggestions?  
Feel free to [start a discussion](https://github.com/obeddiaz/Easy-Route-Management/discussions) or [open an issue](https://github.com/obeddiaz/Easy-Route-Management/issues) on GitHub.  
Your feedback helps me to improve Easy Route Management for everyone!

## 🔗 GitHub Repository

You can find the source code, report issues, or contribute here:
[Repository](https://github.com/obeddiaz/Easy-Route-Management)
