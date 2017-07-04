import Route from 'wb-ui-base-app/routes/application';
import LandingPageMixin from 'workbench/mixins/landing-page-mixin';
import Ember from 'ember';

const { getOwner } = Ember;

export default Route.extend(LandingPageMixin, {
    beforeModel () {
        this._super.apply(this, arguments);

        if (this.get('session.isAuthenticated') && this.picklistService){
            return this.picklistService.prefetchAll();
        }
    },
    /**
    * Setting up data for template
    */
    setupController (controller) {
        this._super.apply(this, arguments);

        if (this.get('session.isAuthenticated')){
            controller.setProperties({
                showGlobalSearch: true,
                rmwbIntegration: Ember.rmwbIntegration
            });
        }
    },
    actions: {
        showUserProfileClick () {
            this.flyoutManager.openFlyout('wb-user-profile');
        },
        sessionAuthenticationSucceeded () {
            var _super = this._super;
            this.picklistService.prefetchAll().then(()=> {
                let targetName = this.get('session.attemptedTransition.targetName');
                //Setting up data for template
                this.controller.setProperties({
                    showGlobalSearch: true,
                    rmwbIntegration: Ember.rmwbIntegration
                });
                //check to load deafult homePage or a specific URL
                if (Ember.isEmpty(targetName) || 'index'.includes(targetName)) {
                    Ember.run.next(this.navigatePreferredHomePage.bind(this));
                } else {
                    _super.apply(this, arguments);
                    Ember.run.next(()=> {
                        this.controllerFor('primary-nav').setNavLinks();
                    });
                }
            });
        },
        sessionAuthenticationFailed (e) {
            //flash message not required- errMsgs are shown on login screen itself
            // let message = e.message;
            // if (!Ember.isEmpty(message)) {
            //     let wbFlashMessages = getOwner(this).lookup('service:wbFlashMessages');
            //     wbFlashMessages.clearMessages();
            //     wbFlashMessages.success(message, {
            //         sticky: true
            //     });
            // }
        },
        onLoginActivate: function onLoginActivate() {
            // RMWB 1.0 logout to clear all the locks and sessions.
            Ember.$.ajax({
              url: 'rmwb/logout'
            });
            this._super.apply(this, arguments);
        },
        navigatePreferredHomePage (reloadNavLinks) {
            if (this.get('session.isAuthenticated')){
                this.picklistService.prefetchAll().then(()=> {
                    this.navigatePreferredHomePage(reloadNavLinks);
                });
            }
        },
        didTransition () {
            //Fix for ALM-4404
            if (Ember.$('#secondary-nav')) {
                Ember.$('#secondary-nav').scrollTop(0);
            }
            this._super();
        },
        willTransition () {
            let liveFeedRef = getOwner(this).lookup('controller:top-bar');
            if (!liveFeedRef.get('hideLiveFeed')) {
                liveFeedRef.set('hideLiveFeed', true);
            }
            this._super();
        }
    }
});
