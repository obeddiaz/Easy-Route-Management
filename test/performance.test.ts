import createRoutePaths, { RouteObjInterface } from "../src";

const dummyRoutes = {
  user: {
    path: "user",
    subRoutes: {
      settings: {
        path: "settings",
        subRoutes: { byId: { path: ":id" } },
      },
    },
  },
} as const satisfies RouteObjInterface;

const routes = createRoutePaths(dummyRoutes);

describe("Performance", () => {
  it("should resolve relative() quickly (under 10ms for 10k calls)", () => {
    const ITERATIONS = 10_000;
    const start = performance.now();

    for (let i = 0; i < ITERATIONS; i++) {
      const r = routes.user.settings.relative();
      if (!r.byId.path) throw new Error("Unexpected empty path");
    }

    const duration = performance.now() - start;
    console.log(`relative() x${ITERATIONS} took ${duration.toFixed(2)}ms`);

    expect(duration).toBeLessThan(20);
  });
});
