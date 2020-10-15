<template>
    <div class="view-home vertical-layout">
        <Header />

        <main class="main">
            <div class="narrow-container">
                <router-view></router-view>
            </div>
        </main>

        <Footer />
    </div>
</template>

<script>
import Header from '../../components/Header/Header.vue';
import Footer from '@/components/Footer/Footer.vue';

export default {
    components: {
        Footer,
        Header,
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
