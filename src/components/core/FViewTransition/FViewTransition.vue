<template>
    <div class="view-transition animation-container children-absolute">
        <transition :name="transitionName" @before-enter="onBeforeEnter" @after-leave="onAfterLeave">
            <slot></slot>
        </transition>
    </div>
</template>

<script>
import { Tree } from '../../../utils/tree.js';

export default {
    name: 'FViewTransition',

    props: {
        /**
         * @type {WalletAppStructureNode[]}
         */
        viewsStructure: {
            type: Array,
            default() {
                return [];
            },
        },
        /** Go-to-child transition name. */
        forwardTransition: {
            type: String,
            default: 'slide-left',
        },
        /** Go-to-parent transition name. */
        backwardTransition: {
            type: String,
            default: 'slide-right',
        },
        /** Watch for router changes. */
        watchRoute: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            transitionName: '',
        };
    },

    watch: {
        $route(_to, _from) {
            const { _viewsStructure } = this;

            // Choose transition (forward or backward) according to position of route nodes in views structure.
            if (this.watchRoute && _viewsStructure) {
                const nodeTo = _viewsStructure.getBy(_to.name, 'route');
                const nodeFrom = _viewsStructure.getBy(_from.name, 'route');

                if (nodeTo && nodeFrom) {
                    // if nodeFrom is parent of nodeTo
                    if (_viewsStructure.getParentsBy(nodeFrom.id, 'id', nodeTo).length > 0) {
                        this.transitionName = this.forwardTransition;
                    } else {
                        this.transitionName = this.backwardTransition;
                    }
                }
            }
        },
    },

    created() {
        /** @type {Tree} */
        this._viewsStructure = this.viewsStructure.length > 0 ? new Tree(this.viewsStructure) : null;
    },

    beforeDestroy() {
        this._viewsStructure = null;
    },

    methods: {
        onBeforeEnter() {
            document.body.classList.add('view-transition-on');
        },

        onAfterLeave() {
            document.body.classList.remove('view-transition-on');
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
