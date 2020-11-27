<template>
    <div class="f-simple-navigation" :class="{ 'f-simple-navigation--vertical': vertical }">
        <component :is="navTag">
            <slot>
                <ul v-if="cItems" class="no-markers">
                    <li v-for="item in cItems" :key="item.id">
                        <router-link
                            v-if="!item.outerLink"
                            :to="item.url"
                            :class="{ disabled: item.disabled, 'router-link-active': item._active }"
                            :title="item.linkTitle"
                            :target="item.blank ? '_blank' : null"
                        >
                            <icon
                                v-if="item.icon"
                                :data="item.icon"
                                :width="item.iconSize || iconSize"
                                :height="item.iconSize || iconSize"
                                :fill="item.fill || false"
                            />
                            <span class="title">{{ item.title }}</span>
                        </router-link>
                        <a
                            v-else
                            :href="item.url"
                            :class="{ disabled: item.disabled, 'router-link-active': item._active }"
                            :title="item.linkTitle"
                            :target="item.blank ? '_blank' : null"
                        >
                            <icon
                                v-if="item.icon"
                                :data="item.icon"
                                :width="item.iconSize || iconSize"
                                :height="item.iconSize || iconSize"
                                :fill="item.fill || false"
                            />
                            <span class="title">{{ item.title }}</span>
                        </a>
                    </li>
                </ul>
            </slot>
        </component>
    </div>
</template>

<script>
import { helpersMixin } from '../../../mixins/helpers.js';
import { getAppNodeParents } from '@/app-structure.js';
import { cloneObject } from '@/utils';

export default {
    mixins: [helpersMixin],

    props: {
        /**
         * Array of navigation links.
         *
         * @type {{title: string, url: string}[]}
         */
        items: {
            type: Array,
            default() {
                return [];
            },
        },
        /** Default icon size */
        iconSize: {
            type: String,
            default: '32',
        },
        /** Render <nav> element. */
        renderNav: {
            type: Boolean,
            default: true,
        },
        /** Render navigation as column. */
        vertical: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            dItems: [],
        };
    },

    computed: {
        cItems() {
            this.setIds(this.dItems);

            return this.dItems;
        },

        navTag() {
            return this.renderNav ? 'nav' : 'div';
        },

        routeNames() {
            return this.dItems.map((_item) => _item.url.name);
        },
    },

    watch: {
        /**
         * Watches for vue route change.
         */
        $route(_route) {
            this.processRoute(_route);
        },
    },

    mounted() {
        this.dItems = this.items;
        this.processRoute(this.$route);
    },

    methods: {
        /**
         * @param {object} _route
         */
        processRoute(_route) {
            const { routeNames } = this;
            const appNode = getAppNodeParents(_route.name).find((_item) => routeNames.includes(_item.route));

            if (appNode) {
                const items = cloneObject(this.items);

                items.forEach((_item) => {
                    _item._active = _item.url.name === appNode.route;
                });

                this.dItems = items;
            }
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
