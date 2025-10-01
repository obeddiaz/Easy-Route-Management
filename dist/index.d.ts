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
        acceptedPathValues?: Record<string, readonly string[]> & NotAllowedRouteObjParams;
    };
} & NotAllowedRouteObjParams;
type RouteParams<T extends string, V extends Record<string, readonly string[]> | undefined> = T extends `${infer _Start}:${infer Param}/${infer Rest}` ? {
    [K in Param | keyof RouteParams<Rest, V>]: V extends Record<K, readonly string[]> ? V[K][number] : string;
} : T extends `${infer _Start}:${infer Param}` ? V extends Record<string, readonly string[]> ? {
    [K in Param]: V[Param][number];
} : {
    [K in Param]: string;
} : null;
type GeneratePathFunction<T extends string, V extends Record<string, readonly string[]> | undefined> = (params: RouteParams<T, V>) => string;
interface RouteWithGeneratePath<P extends string, SP extends string, V extends Record<string, readonly string[]> | undefined> {
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
    /**
     * Generates the full path with the given parameters.
     * @param params - An object containing the parameters to replace in the path.
     * @returns The full path with the parameters replaced.
     * @example
     * routes.myRoute.byId.generatePath({ pathId: '15' }) // returns "/my-route/15"
     */
    generatePath: GeneratePathFunction<P, V>;
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
type Route<P extends string, SP extends string, V extends Record<string, readonly string[]> | undefined> = RouteParams<P, V> extends null ? RouteWithoutGeneratePath<P, SP> : RouteWithGeneratePath<P, SP, V>;
type InferRoutes<T, ParentPath extends string = '', V extends Record<string, readonly string[]> | undefined = undefined> = {
    [K in keyof T]: T[K] extends {
        path: string;
        subRoutes: unknown;
        acceptedPathValues?: Record<string, readonly string[]>;
    } ? Route<`${ParentPath}/${T[K]['path']}`, T[K]['path'], V & T[K]['acceptedPathValues']> & InferRoutes<T[K]['subRoutes'], `${ParentPath}/${T[K]['path']}`, V extends Record<string, readonly string[]> ? V & T[K]['acceptedPathValues'] : T[K]['acceptedPathValues']> : T[K] extends {
        path: string;
        acceptedPathValues?: Record<string, readonly string[]>;
    } ? Route<`${ParentPath}/${T[K]['path']}`, T[K]['path'], V & T[K]['acceptedPathValues']> : never;
};
declare const createRoutePaths: <T extends RouteObjInterface>(routesObj: T) => InferRoutes<T>;
export default createRoutePaths;
