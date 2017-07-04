import AuthenticatedRoute from 'wb-ui-core/routes/authenticated-route';

export default AuthenticatedRoute.extend({
    beforeModel (transition) {
        transition.send('navigatePreferredHomePage');
        return this._super.apply(this, arguments);
    }
});
