import createRoutePaths, { RouteObjInterface } from "../src";

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
      settings: { path: "settings" },
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

  it("should generate the correct path for user profile route with parameters", () => {
    const path = routes.user.profile.generatePath({ userId: "123" });
    expect(path).toBe("/user/123/profile");
  });

  it("should return the correct path for user settings route", () => {
    expect(routes.user.settings.path).toBe("/user/:userId/settings");
  });

  it("should generate the correct path for user settings route with parameters", () => {
    const path = routes.user.settings.generatePath({ userId: "123" });
    expect(path).toBe("/user/123/settings");
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
    const path = routes.posts.generatePath({});
    expect(path).toBe("/posts/");
  });

  it("should generate the correct path for posts route with parameters", () => {
    const pathWithParam = routes.posts.generatePath({ postId: "123" });
    expect(pathWithParam).toBe("/posts/123");
  });
});
