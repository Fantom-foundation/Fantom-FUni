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
        appNodeId: {
            type: String,
            default: '',
        },
        /** Watch for router changes. */
        watchRoute: {
            type: Boolean,
            default: false,
        },
        /** Transitions are disabled */
        disabled: {
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
            if (this.watchRoute) {
                this.runTransition(_from.name, _to.name);
            }
        },

        appNodeId(_value, _oldValue) {
            this.runTransition(_oldValue, _value);
        },

        disabled(_value) {
            if (_value) {
                this._transitionName = this.transitionName;
                this.transitionName = '';
            } else {
                this.transitionName = this._transitionName;
            }
        },
    },

    created() {
        /** @type {Tree} */
        this._viewsStructure = this.viewsStructure.length > 0 ? new Tree(this.viewsStructure) : null;
        this._transitionName = '';
    },

    beforeDestroy() {
        this._viewsStructure = null;
    },

    methods: {
        runTransition(_nodeFromName, _nodeToName) {
            const { _viewsStructure } = this;

            if (this.disabled) {
                this.transitionName = '';
                return;
            }

            // Choose transition (forward or backward) according to position of route nodes in views structure.
            if (_viewsStructure) {
                const nodeFrom = _viewsStructure.getBy(_nodeFromName, 'id');
                const nodeTo = _viewsStructure.getBy(_nodeToName, 'id');

                if (nodeTo && nodeFrom) {
                    // if nodeFrom is parent of nodeTo
                    if (_viewsStructure.getParentsBy(nodeFrom.id, 'id', nodeTo).length > 0) {
                        this.transitionName = this.forwardTransition;
                    } else {
                        this.transitionName = this.backwardTransition;
                    }
                } else {
                    this.transitionName = '';
                }
            }
        },

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
