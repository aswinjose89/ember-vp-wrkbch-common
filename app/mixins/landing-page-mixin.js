import Ember from 'ember';
import UserPrefMixin from 'wb-ui-core/mixins/wb-user-preference-support';

export default Ember.Mixin.create(UserPrefMixin, {
    picklistService: Ember.inject.service(),
    navigatePreferredHomePage (reloadNavLinks) {       
        if (reloadNavLinks) {
            //Rewires linkTo routes on primary Nav
            this.controllerFor('primary-nav').setNavLinks();
        }
        this.transitionTo(this.getPreferredHomePage());
    },
    getPreferredHomePage () {
        let defaultHomePage = 'wb-ui-sales';
        if (this.get('session.isAuthenticated')) {
            /**
             * Transition to the home page depending on User Preference.
             */
            let preferredHomePage = this.get('userPreferences').get(this.PREF_HOME_PAGE);
            if (!Ember.isEmpty(preferredHomePage)) {
                let homePageObj = this.get('picklistService').getLandingPages().findBy('code', preferredHomePage.get('preference'));
                if (!Ember.isEmpty(homePageObj)) {
                    return homePageObj.get('param1');
                }
            }
        }
        return defaultHomePage;
    }
});
