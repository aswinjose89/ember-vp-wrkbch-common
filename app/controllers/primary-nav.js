import PrimaryNavCOntroller from 'wb-ui-base-app/controllers/primary-nav';
import LandingPageMixin from 'workbench/mixins/landing-page-mixin';
import Ember from 'ember';

export default PrimaryNavCOntroller.extend(LandingPageMixin, {
    init() {
        this._super();
        this.setNavLinks();
    },
    setNavLinks () {
        this.set('navLinks', [
            {
                text: 'Home',
                glyphIcon: 'icon-gauge',
                route: this.getPreferredHomePage()
            }
        ]);
    }
});
