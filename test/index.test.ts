import createRoutePaths, { RouteObjInterface, generatePath } from "../src";

const dummyRoutes = {
  home: {
    path: "home",
  },
  about: {
    path: "about",
    subRoutes: {
      team: { path: "team" },
      mission: { path: "mission" },
    },
  },
  user: {
    path: "user/:userId",
    subRoutes: {
      profile: { path: "profile" },
      settings: {
        path: "settings",
        subRoutes: {
          byId: {
            path: ":settingId",
          },
        },
      },
    },
  },
  posts: {
    path: "posts/:postId?",
  },
} as const satisfies RouteObjInterface;

const routes = createRoutePaths(dummyRoutes);

describe("Route Management", () => {
  it("should return the correct path for home route", () => {
    expect(routes.home.path).toBe("/home");
  });

  it("should return the correct path for about route", () => {
    expect(routes.about.path).toBe("/about");
  });

  it("should return the correct path for about team route", () => {
    expect(routes.about.team.path).toBe("/about/team");
  });

  it("should return the correct path for about mission route", () => {
    expect(routes.about.mission.path).toBe("/about/mission");
  });

  it("should return the correct path for user profile route", () => {
    expect(routes.user.profile.path).toBe("/user/:userId/profile");
  });

  it("should generate the correct path for user", () => {
    const path = generatePath(routes.user, { userId: "123" });
    expect(path).toBe("/user/123");
  });

  it("should generate the correct path for user url encoded", () => {
    const path = generatePath(routes.user, {
      userId: "id with spaces",
    });
    expect(path).toBe("/user/id%20with%20spaces");
  });

  it("should generate the correct path for user profile route with parameters", () => {
    const path = generatePath(routes.user.profile, { userId: "123" });
    expect(path).toBe("/user/123/profile");
  });

  it("should return the correct path for user settings route", () => {
    expect(routes.user.settings.path).toBe("/user/:userId/settings");
  });

  it("should generate the correct path for user settings route with parameters", () => {
    const path = generatePath(routes.user.settings, { userId: "123" });
    expect(path).toBe("/user/123/settings");
  });

  it("should replace multiple parameters correctly", () => {
    const path = generatePath(routes.user.settings.byId, {
      userId: "42",
      settingId: "abc",
    });
    expect(path).toBe("/user/42/settings/abc");
  });

  it("should generate the correct section path for user setting profile", () => {
    expect(routes.user.profile.sectionPath).toBe("profile");
  });

  it("should generate the correct section path for about mission", () => {
    expect(routes.about.mission.sectionPath).toBe("mission");
  });

  it("should return the correct path for posts route", () => {
    expect(routes.posts.path).toBe("/posts/:postId?");
  });

  it("should generate the correct path for user settings route without parameters", () => {
    const path = generatePath(routes.posts, {});
    expect(path).toBe("/posts/");
  });

  it("should generate the correct path for posts route with parameters", () => {
    const pathWithParam = generatePath(routes.posts, { postId: "123" });
    expect(pathWithParam).toBe("/posts/123");
  });

  it("should encode multiple values correctly", () => {
    const path = generatePath(routes.user, { userId: "a b/c" });
    expect(path).toBe("/user/a%20b%2Fc");
  });
});
