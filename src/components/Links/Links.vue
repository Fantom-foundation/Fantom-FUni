<template>
    <div class="links">
        <f-simple-navigation :items="links" :render-nav="false" icon-size="16" vertical />
    </div>
</template>

<script>
import FSimpleNavigation from '@/components/core/FSimpleNavigation/FSimpleNavigation.vue';
import infoIcon from '../../assets/svg/info.svg';
import codeIcon from '../../assets/svg/code.svg';

export default {
    name: 'Links',

    components: { FSimpleNavigation },

    data() {
        return {
            links: [
                {
                    title: 'About',
                    url: 'https://fantom.foundation/blog/launching-funi-uniswap-on-fantom/',
                    outerLink: true,
                    blank: true,
                    icon: infoIcon,
                    fill: true,
                },
                {
                    title: 'Code',
                    url: 'https://github.com/Fantom-foundation/Fantom-FUni',
                    outerLink: true,
                    blank: true,
                    icon: codeIcon,
                    fill: true,
                },
                {
                    title: 'Code 2',
                    url: 'https://github.com/Fantom-foundation/Fantom-Uniswap',
                    outerLink: true,
                    blank: true,
                    icon: codeIcon,
                    fill: true,
                },
            ],
        };
    },
};
</script>
