import Vue from 'vue';
import VueRouter from 'vue-router';
import { routes } from '../routes.js';
// import { routes } from '../routes-maintenance.js';

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
