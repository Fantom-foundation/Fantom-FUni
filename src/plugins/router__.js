import Vue from 'vue';
import VueRouter from 'vue-router';
import { routes } from '../routes.js';
import { store } from '../store';
import appConfig from '../../app.config.js';

Vue.use(VueRouter);

export const router = new VueRouter({
    routes,
    scrollBehavior(_to, _from, _savedPosition) {
        const { history } = window;
        let position = { x: 0, y: 0 }; // Scroll to top

        if (history.scrollRestoration === 'manual') {
            history.scrollRestoration = 'auto';
        }

        if (_savedPosition) {
            return _savedPosition;
        } else if (_to.meta.dontScrollToTop) {
            position = {};
        }

        // Scroll to top
        if (position.x === 0 && position.y === 0) {
            history.scrollRestoration = 'manual';
        }

        return position;
    },
    // mode: 'history'
});

router.beforeEach((_to, _from, _next) => {
    // redirect to dashboard if an account exists and we are on homepage
    if (!_from.name && _to.name === 'welcome' && store.getters.accounts.length > 0) {
        _next({ name: 'dashboard' });
    } else if (appConfig.tmpWFTM) {
        // disable routes to flend
        if (_to.path.indexOf('/flend') === -1) {
            _next();
        }
    } else {
        _next();
    }
});
