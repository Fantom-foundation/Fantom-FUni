import { Tree } from '@/utils/tree.js';
import { appStructureTree } from '@/app-structure.js';

/**
 * Helper methods and properties for handling component changes via `<component>`.
 */
export const componentViewMixin = {
    data() {
        return {
            currentComponent: '',
            currentAppNodeId: '',
            viewsStructureRootNode: '',
            _viewsStructure: null,
        };
    },

    computed: {
        currentComponentProperties() {
            if (this.currentComponent) {
                return this._cwmData;
            }

            return null;
        },

        viewsStructure() {
            const node = this.viewsStructureRootNode;
            const appNode = appStructureTree.serialize(appStructureTree.get(node));

            if (!this.currentAppNodeId) {
                // eslint-disable-next-line vue/no-side-effects-in-computed-properties
                this.currentAppNodeId = node;
            }

            return appNode ? [JSON.parse(appNode)] : [];
        },
    },

    created() {
        // temporary data
        this._cwmData = null;
    },

    methods: {
        changeComponent(_compName, _data = null) {
            let compName = _compName;

            if (this.viewsStructure) {
                if (!this._viewsStructure) {
                    this._viewsStructure = new Tree(this.viewsStructure);
                }

                let appNode = this._viewsStructure.getBy(compName, 'id');

                if (!appNode) {
                    appNode = this._viewsStructure.getBy(compName, 'component');
                }

                if (appNode && appNode.component) {
                    compName = appNode.component;
                    this.currentAppNodeId = appNode.id;
                }
            }

            this._cwmData = _data;
            this.currentComponent = compName;

            this.$nextTick(() => {
                this._cwmData = null;
            });
        },

        /**
         * @param {Object} _data
         */
        onChangeComponent(_data) {
            this.changeComponent(_data.to, _data.data);
        },
    },
};
