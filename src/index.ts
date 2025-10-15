type NotAllowedRouteObjParams = {
  subRoutes?: never;
  path?: never;
  generatePath?: never;
  sectionPath?: never;
  acceptedPathValues?: never;
};

export type RouteObjInterface = {
  [key: string]: {
    /**
     * Defines the section path for the route. Use a prefix ":" for route variables.
     * @example
     * { path: "my-route" }
     * { path: ":id" }
     * { path: "my-route/:id" }
     * { path: "my-route/:id/:anotherId" }
     * { path: "my-route/:id/:anotherId/route-continue" }
     */
    path: string;
    /**
     * Defines sub-routes that continue from the previous path.
     * @example
     * {
     *   path: "my-route",
     *   subRoutes: {
     *     routeContinue: {
     *       path: 'route-continue'
     *     }
     *   }
     * }
     */
    subRoutes?: RouteObjInterface & NotAllowedRouteObjParams;
    /**
     * Specifies accepted values for route variables.
     * @example
     * {
     *   path: ":myVariable",
     *   acceptedPathValues: {
     *     myVariable: ['value1', 'value2']
     *   }
     * }
     * When calling your route with `generatePath`, the accepted parameters will be:
     * {
     *   myVariable: "value1" | "value2"
     * }
     */
    acceptedPathValues?: Record<string, readonly string[]> &
      NotAllowedRouteObjParams;
  };
} & NotAllowedRouteObjParams;

type RouteParams<
  T extends string,
  V extends Record<string, readonly string[]> | undefined = undefined,
> = T extends `${infer _Start}:${infer Param}/${infer Rest}`
  ? Param extends `${infer P}?`
    ? {
        [K in P | keyof RouteParams<Rest, V>]: K extends P
          ? V extends Record<K, readonly string[]>
            ? V[K][number] | undefined
            : string | undefined
          : K extends keyof RouteParams<Rest, V>
            ? RouteParams<Rest, V>[K]
            : never;
      }
    : {
        [K in Param | keyof RouteParams<Rest, V>]: K extends Param
          ? V extends Record<K, readonly string[]>
            ? V[K][number]
            : string
          : K extends keyof RouteParams<Rest, V>
            ? RouteParams<Rest, V>[K]
            : never;
      }
  : T extends `${infer _Start}:${infer Param}`
    ? Param extends `${infer P}?`
      ? {
          [K in P]?: V extends Record<P, readonly string[]>
            ? V[P][number]
            : string;
        }
      : {
          [K in Param]: V extends Record<Param, readonly string[]>
            ? V[Param][number]
            : string;
        }
    : null;

interface RouteWithGeneratePath<
  P extends string,
  SP extends string,
  V extends Record<string, readonly string[]> | undefined,
> {
  /**
   * @internal This property is intended for type inference only. Do not use it directly.
   *
   * @example
   * type MyRouteParams = typeof routes.myRoute.bySection._routeParams;
   * // MyRouteParams should be { section: "value1" | "value2" } | { section: string }
   */
  _routeParams: RouteParams<P, V>;
  /**
   * The full path of the route.
   * @example
   * routes.myRoute.path // returns "/my-route"
   * routes.myRoute.mySubRoute.path // returns "/my-route/sub-route"
   * routes.myRoute.byId.path // returns "/my-route/:pathId"
   */
  path: P;
  /**
   * The section path of the route, relative to its parent.
   * @example
   * routes.myRoute.sectionPath // returns "/my-route"
   * routes.myRoute.mySubRoute.sectionPath // returns "/sub-route"
   * routes.myRoute.byId.sectionPath // returns "/:pathId"
   */
  sectionPath: SP;
}

interface RouteWithoutGeneratePath<P extends string, SP extends string> {
  /**
   * The full path of the route.
   * @example
   * routes.myRoute.path // returns "/my-route"
   * routes.myRoute.mySubRoute.path // returns "/my-route/sub-route"
   */
  path: P;
  /**
   * The section path of the route, relative to its parent.
   * @example
   * routes.myRoute.sectionPath // returns "/my-route"
   * routes.myRoute.mySubRoute.sectionPath // returns "/sub-route"
   */
  sectionPath: SP;
}

type Route<
  P extends string,
  SP extends string,
  V extends Record<string, readonly string[]> | undefined,
> =
  RouteParams<P, V> extends null
    ? RouteWithoutGeneratePath<P, SP>
    : RouteWithGeneratePath<P, SP, V>;

type InferRoutes<
  T,
  ParentPath extends string = "",
  V extends Record<string, readonly string[]> | undefined = undefined,
> = {
  [K in keyof T]: T[K] extends {
    path: string;
    subRoutes: unknown;
    acceptedPathValues?: Record<string, readonly string[]>;
  }
    ? Route<
        `${ParentPath}/${T[K]["path"]}`,
        T[K]["path"],
        V & T[K]["acceptedPathValues"]
      > &
        InferRoutes<
          T[K]["subRoutes"],
          `${ParentPath}/${T[K]["path"]}`,
          V extends Record<string, readonly string[]>
            ? V & T[K]["acceptedPathValues"]
            : T[K]["acceptedPathValues"]
        >
    : T[K] extends {
          path: string;
          acceptedPathValues?: Record<string, readonly string[]>;
        }
      ? Route<
          `${ParentPath}/${T[K]["path"]}`,
          T[K]["path"],
          V & T[K]["acceptedPathValues"]
        >
      : never;
};

/**
 * Generates a full route path by replacing dynamic segments (e.g. `:userId`)
 * in a route definition with their corresponding parameter values.
 *
 * This function preserves type safety when used with route objects created
 * by `createRoutePaths()`, inferring the correct parameter names and accepted values.
 *
 * @example
 * // Example using a route object
 * generatePath(routes.user.bySection, { userId: '123', section: 'section1' });
 * // => '/user/123/section1'
 *
 * @param {object} route - The route object returned by `createRoutePaths()`.
 * Must include a `path` property (and optional `_routeParams` type metadata).
 * @param {object} [params] - Key/value pairs mapping route parameter names
 * to their corresponding string values.
 *
 * @return {string} The resolved path with all parameters substituted.
 *
 * @throws {Error} If the provided route object is invalid or not compatible.
 */
const generatePath = <
  P extends { path: string; _routeParams?: Record<string, string> },
>(
  route: P,
  params?: P["_routeParams"],
): string => {
  if (
    typeof route !== "object" ||
    route === null ||
    typeof route.path !== "string"
  ) {
    throw new Error(
      "[easy-route-management] Invalid route object: expected an object with a `path` string.",
    );
  }

  if (params && typeof params !== "object") {
    throw new Error(
      "[easy-route-management] Invalid params: expected an object mapping route params to values.",
    );
  }

  if (!params) {
    return route.path;
  }

  return route.path
    .replace(/:([^/?]+)\??/g, (_, key: string) => {
      if (params[key] != null) {
        return encodeURIComponent(params[key]);
      }
      return "";
    })
    .replace(/\/+/g, "/");
};

type GenericRouteType = {
  path: string;
  sectionPath: string;
  generatePath?: (params: { [key: string]: string }) => string;
} & {
  [key: string]:
    | GenericRouteType
    | string
    | ((params: { [key: string]: string }) => string)
    | undefined;
};

const generateRouteParams = (
  routesObj: RouteObjInterface[string],
  prevPath = "",
): GenericRouteType => {
  const routes: GenericRouteType = {
    path: `${prevPath}/${routesObj.path}`,
    sectionPath: routesObj.path,
  };
  if (routesObj.subRoutes) {
    Object.keys(routesObj.subRoutes).forEach((key) => {
      routes[key] = generateRouteParams(
        routesObj!.subRoutes![key],
        routes.path,
      );
    });
  }
  return routes;
};

const createRoutePaths = <T extends RouteObjInterface>(
  routesObj: T,
): InferRoutes<T> => {
  const routes: RouteObjInterface = {};
  Object.keys(routesObj).forEach((routeKey) => {
    routes[routeKey] = generateRouteParams(routesObj[routeKey]);
  });
  return routes as InferRoutes<T>;
};

export { generatePath };

export default createRoutePaths;
