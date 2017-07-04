import Ember from 'ember';
import LandingPageMixinMixin from '../../../mixins/landing-page-mixin';
import { module, test } from 'qunit';

module('Unit | Mixin | landing page mixin');

// Replace this with your real tests.
test('it works', function (assert) {
    let LandingPageMixinObject = Ember.Object.extend(LandingPageMixinMixin),
        subject = LandingPageMixinObject.create();
    assert.ok(subject);
});
