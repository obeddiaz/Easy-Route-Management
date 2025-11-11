type NotAllowedRouteObjParams = {
  subRoutes?: never;
  path?: never;
  relative?: never;
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

interface RouteWithRouteParams<
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

interface RouteWithoutRouteParams<P extends string, SP extends string> {
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
    ? RouteWithoutRouteParams<P, SP>
    : RouteWithRouteParams<P, SP, V>;

type StripRelative<T> = {
  [K in keyof T as K extends "relative" ? never : K]: T[K] extends object
    ? StripRelative<T[K]>
    : T[K];
};

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
        > & {
          /**
           * Return the relative path to the parent node
           *
           * @param includeLeadingSlash - Optional override; when true, forces a leading "/".
           *
           * @returns A new route object starting from the current level.
           *
           * @example
           * routes.myRoute.mySubRoute.path // returns "/my-route/sub-route"
           * routes.myRoute.mySubRoute.relative().path // returns "/sub-route"
           */
          relative: (
            includeLeadingSlash?: boolean,
          ) => Route<
            `/${T[K]["path"]}`,
            T[K]["path"],
            T[K]["acceptedPathValues"]
          > &
            StripRelative<
              InferRoutes<
                T[K]["subRoutes"],
                `/${T[K]["path"]}`,
                T[K]["acceptedPathValues"]
              >
            >;
        }
    : T[K] extends {
          path: string;
          acceptedPathValues?: Record<string, readonly string[]>;
        }
      ? Route<
          `${ParentPath}/${T[K]["path"]}`,
          T[K]["path"],
          V & T[K]["acceptedPathValues"]
        > & {
          /**
           * Return the relative path to the parent node
           *
           * @param includeLeadingSlash - Optional override; when true, forces a leading "/".
           *
           * @returns A new route object starting from the current level.
           *
           * @example
           * routes.myRoute.mySubRoute.path // returns "/my-route/sub-route"
           * routes.myRoute.mySubRoute.relative().path // returns "/sub-route"
           */
          relative: (
            includeLeadingSlash?: boolean,
          ) => Route<
            `/${T[K]["path"]}`,
            T[K]["path"],
            T[K]["acceptedPathValues"]
          >;
        }
      : never;
};

// Keep a single "/" between segments
type Join<Base extends string, Seg extends string> = Base extends ""
  ? Seg
  : Seg extends ""
    ? Base
    : `${Base}/${Seg}`;

// Map any dynamic segment (with or without "?") to ":param"
type NormalizeSegment<S extends string> = S extends `:${string}` | `:${string}?`
  ? ":param"
  : S;

/**
 * Expand optionals in a path into a union of variants and normalize each segment.
 * Example:
 *  ExpandOptionals<"home/:id?">  ->  "home" | "home/:param"
 *  ExpandOptionals<"a/:x?/b">    ->  "a/b" | "a/:param/b"
 */
type ExpandOptionals<
  S extends string,
  Acc extends string = "",
> = S extends `${infer Head}/${infer Tail}`
  ? Head extends `:${string}?`
    ? // optional segment: skip OR include ":param"
      ExpandOptionals<Tail, Acc> | ExpandOptionals<Tail, Join<Acc, ":param">>
    : // required segment
      ExpandOptionals<Tail, Join<Acc, NormalizeSegment<Head>>>
  : S extends `:${string}?`
    ? // optional final segment: skip OR include
      Acc | Join<Acc, ":param">
    : // required final segment
      Join<Acc, NormalizeSegment<S>>;

// Extract subRoutes record if present
type HasSubRoutes<X> = X extends { subRoutes: infer SR }
  ? SR extends Record<string, object>
    ? SR
    : never
  : never;

// All full paths under a level (record of nodes), given a base
type SubtreePathsOfLevel<
  T extends Record<string, { path: string }>,
  Base extends string,
> = {
  [K in keyof T & string]: SubtreePathsOfNode<T[K], Base>;
}[keyof T & string];

// Distribute a union base into level computation
type SubtreePathsOfLevelWithBaseUnion<
  T extends Record<string, { path: string }>,
  BaseUnion extends string,
> = BaseUnion extends string ? SubtreePathsOfLevel<T, BaseUnion> : never;

type SubtreePathsOfNode<Node, Base extends string> = Node extends {
  path: infer P extends string;
}
  ? // Node's own full paths (prefixed with "/")
    | `/${ExpandOptionals<Join<Base, P>>}`
      // Descendants: carry each expanded base variant downward
      | (HasSubRoutes<Node> extends infer SR
          ? SR extends Record<string, { path: string }>
            ? SubtreePathsOfLevelWithBaseUnion<
                SR,
                ExpandOptionals<Join<Base, P>>
              >
            : never
          : never)
  : never;

type DuplicateFullPathsAtLevel<
  T extends Record<string, { path: string }>,
  Base extends string,
> = {
  [K in keyof T & string]: {
    [P in Exclude<keyof T & string, K> & string]: Extract<
      SubtreePathsOfNode<T[K], Base>,
      SubtreePathsOfNode<T[P], Base>
    > extends never
      ? never
      : `Duplicate full path under "${K}" and "${P}": ${Extract<
          SubtreePathsOfNode<T[K], Base>,
          SubtreePathsOfNode<T[P], Base>
        >}`;
  }[Exclude<keyof T & string, K> & string];
}[keyof T & string];

type NoDuplicateFullPathsAtLevel<
  T extends Record<string, { path: string }>,
  Base extends string,
> = DuplicateFullPathsAtLevel<T, Base> extends never ? unknown : never;

// Recurse into subRoutes, carrying the expanded base (and fix T[K]["path"] narrowing)
type NoDuplicateFullPathsRecursive<T, Base extends string = ""> =
  // Validate this level
  (T extends Record<string, { path: string }>
    ? NoDuplicateFullPathsAtLevel<T, Base>
    : unknown) &
    // Recurse into children
    {
      [K in keyof T]: T[K] extends {
        path: infer P extends string;
        subRoutes: infer SR extends Record<string, { path: string }>;
      }
        ? {
            subRoutes: NoDuplicateFullPathsRecursive<
              SR,
              ExpandOptionals<Join<Base, P>>
            >;
          }
        : unknown;
    };

/**
 * Performs compile-time validation of route definitions without modifying them.
 *
 * `defineRoutes` takes a route object and returns it unchanged, while applying
 * a type-level check that ensures no two routes produce the same full path
 * pattern (even if their parameter names differ).
 *
 * If a duplicated route shape is detected, TypeScript will throw an error
 * at compile time. No runtime logic is added and no code is transformed.
 *
 * @param {object} t The route object definition to validate.
 *
 * @return {object} The same route object, unchanged. Used purely for compile-time validation.
 */
export const defineRoutes = <T extends RouteObjInterface>(
  t: T & NoDuplicateFullPathsRecursive<T>,
) => t;

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
  params: P["_routeParams"],
): P["path"] => {
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
  relative?: (
    includeLeadingSlash?: boolean,
  ) => Omit<GenericRouteType, "relative">;
} & {
  [key: string]:
    | GenericRouteType
    | string
    | ((params: { [key: string]: string }) => string)
    | undefined;
};

type CreateRoutePathsOptions = {
  /**
   * When `true` (default), all generated routes
   * start with a leading slash (e.g., `/user/settings`). When `false`, the
   * leading slash is omitted (e.g., `user/settings`), which is useful for
   * frameworks like Angular that expect relative-style paths.
   *
   * @example
   * const routes = createRoutePaths(routesObj, { includeLeadingSlash: false });
   * routes.user.settings.path // => "user/settings"
   */
  includeLeadingSlash?: boolean;
};

const createRoutePaths = <T extends RouteObjInterface>(
  routesObj: T,
  options?: CreateRoutePathsOptions,
): InferRoutes<T> => {
  const routes: RouteObjInterface = {};
  const { includeLeadingSlash = true } = options || {};
  const baseRoute = includeLeadingSlash ? "/" : "";

  const generateRouteParams = (
    innerRoutesObj: RouteObjInterface[string],
    prevPath = "",
    isRelative = false,
  ): GenericRouteType => {
    const routes: GenericRouteType = {
      path: `${prevPath}${innerRoutesObj.path}`,
      sectionPath: innerRoutesObj.path,
    };

    if (!isRelative) {
      routes.relative = (overrideIncludeLeadingSlash) => {
        if (overrideIncludeLeadingSlash !== undefined) {
          return generateRouteParams(
            innerRoutesObj,
            overrideIncludeLeadingSlash ? "/" : "",
            true,
          );
        }
        return generateRouteParams(innerRoutesObj, baseRoute, true);
      };
    }
    if (innerRoutesObj.subRoutes) {
      Object.keys(innerRoutesObj.subRoutes).forEach((key) => {
        routes[key] = generateRouteParams(
          innerRoutesObj!.subRoutes![key],
          `${routes.path}/`,
          isRelative,
        );
      });
    }
    return routes;
  };

  Object.keys(routesObj).forEach((routeKey) => {
    routes[routeKey] = generateRouteParams(
      routesObj[routeKey],
      baseRoute,
      false,
    );
  });
  return routes as InferRoutes<T>;
};

export { generatePath };

export default createRoutePaths;
