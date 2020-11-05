<template>
    <div class="f-dark-mode-switch">
        <f-toggle-button v-model="darkModeOn" :title="title" :aria-label="title" label="Dark Mode" />
    </div>
</template>

<script>
import FToggleButton from '@/components/core/FToggleButton/FToggleButton.vue';
export default {
    name: 'FDarkModeSwitch',

    components: { FToggleButton },

    data() {
        return {
            darkModeOn: false,
        };
    },

    computed: {
        title() {
            return this.darkModeOn ? 'Switch to light mode' : 'Switch to dark mode';
        },
    },

    watch: {
        darkModeOn(_value) {
            const appNode = this.$root.$children[0];

            if (appNode) {
                appNode.setDarkMode(_value);
            }
        },
    },

    created() {
        this.darkModeOn = this.$store.state.darkMode;
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
