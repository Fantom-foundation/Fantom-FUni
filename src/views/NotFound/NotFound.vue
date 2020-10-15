<template>
    <div class="view-not-found center-v-h">
        <div class="message">
            <h1 class="h4">{{ $t('view_not_found.title') }}</h1>
            {{ $t('view_not_found.text') }}

            <router-link to="/" class="router-link">{{ $t('view_not_found.link_title') }}</router-link>
        </div>
    </div>
</template>

<script>
export default {
    /*
        mounted() {
            setTimeout(() => {
                this.$router.replace({name: 'home'});
            }, 2000)
        }
*/
};
</script>

<style lang="scss">
@import 'style';
</style>
