"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Check if the route has params, so we define generatePath funciton to the object.
 * @param {string} s The first number.
 *
 * @return {boolean} The sum of the two numbers.
 */
function checkRouteParams(s) {
    const pattern = /^\/([^/]+\/)*:[^/]+(\/[^/]+)*$/;
    return pattern.test(s);
}
const generateRouteParams = (routesObj, prevPath = "", hasParams = false) => {
    const routes = {
        path: `${prevPath}/${routesObj.path}`,
        sectionPath: routesObj.path,
    };
    const routeHasParams = hasParams || checkRouteParams(routes.path);
    if (routesObj.subRoutes) {
        Object.keys(routesObj.subRoutes).forEach((key) => {
            routes[key] = generateRouteParams(routesObj.subRoutes[key], routes.path, routeHasParams);
        });
    }
    if (routeHasParams) {
        routes.generatePath = (params = {}) => {
            const { path } = routes;
            return path
                .replace(/:([^/?]+)\??/g, (_, key) => {
                if (params[key] != null) {
                    return params[key];
                }
                return "";
            })
                .replace(/\/+/g, "/");
        };
    }
    return routes;
};
const createRoutePaths = (routesObj) => {
    const routes = {};
    Object.keys(routesObj).forEach((routeKey) => {
        routes[routeKey] = generateRouteParams(routesObj[routeKey]);
    });
    return routes;
};
exports.default = createRoutePaths;
