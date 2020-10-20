<template>
    <div class="f-simple-navigation" :class="{ 'f-simple-navigation--vertical': vertical }">
        <component :is="navTag">
            <slot>
                <ul v-if="cItems" class="no-markers">
                    <li v-for="item in cItems" :key="item.id">
                        <router-link
                            v-if="!item.outerLink"
                            :to="item.url"
                            :class="{ disabled: item.disabled }"
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
                            :class="{ disabled: item.disabled }"
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

    computed: {
        cItems() {
            this.setIds(this.items);

            return this.items;
        },

        navTag() {
            return this.renderNav ? 'nav' : 'div';
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
