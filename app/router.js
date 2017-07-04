import config from './config/environment';
import RouteMap from './route-map';
import WBRouter from 'wb-ui-core/wb-router';

var Router = WBRouter.extend({
    location: config.locationType
});

Router.map(RouteMap);

export default Router;
