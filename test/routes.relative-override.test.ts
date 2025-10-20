import createRoutePaths, { RouteObjInterface, generatePath } from "../src";

const dummyRoutes = {
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

describe("relative() override includeLeadingSlash", () => {
  it("should respect global includeLeadingSlash = false by default", () => {
    const routes = createRoutePaths(dummyRoutes, {
      includeLeadingSlash: false,
    });

    const rel = routes.user.settings.relative();
    expect(rel.byId.path).toBe("settings/:settingId");

    const generated = generatePath(rel.byId, { settingId: "123" });
    expect(generated).toBe("settings/123");
  });

  it("should override and force leading slash when passing true", () => {
    const routes = createRoutePaths(dummyRoutes, {
      includeLeadingSlash: false,
    });

    const rel = routes.user.settings.relative(true);
    expect(rel.byId.path).toBe("/settings/:settingId");

    const generated = generatePath(rel.byId, { settingId: "123" });
    expect(generated).toBe("/settings/123");
  });

  it("should respect global includeLeadingSlash = true by default", () => {
    const routes = createRoutePaths(dummyRoutes, { includeLeadingSlash: true });

    const rel = routes.user.settings.relative();
    expect(rel.byId.path).toBe("/settings/:settingId");

    const generated = generatePath(rel.byId, { settingId: "123" });
    expect(generated).toBe("/settings/123");
  });

  it("should override and remove leading slash when passing false", () => {
    const routes = createRoutePaths(dummyRoutes, { includeLeadingSlash: true });

    const rel = routes.user.settings.relative(false);
    expect(rel.byId.path).toBe("settings/:settingId");

    const generated = generatePath(rel.byId, { settingId: "123" });
    expect(generated).toBe("settings/123");
  });
});
