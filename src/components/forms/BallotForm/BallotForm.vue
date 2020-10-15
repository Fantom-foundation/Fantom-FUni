<template>
    <div class="ballot-form">
        <f-card class="f-card-double-padding">
            <f-form center-form @f-form-submit="onFormSubmit">
                <fieldset class="f-data-layout">
                    <legend class="h2 cont-with-back-btn">
                        <span>
                            Vote <span class="f-steps"><b>1</b> / 2</span>
                        </span>
                        <button type="button" class="btn light" @click="onPreviousBtnClick">Back</button>
                    </legend>

                    <div class="form-body">
                        <h2 class="align-center">
                            {{ ballot.name }} <br />
                            <span v-if="ballot.detailsUrl" class="more-info">
                                <a :href="ballot.detailsUrl" target="_blank">(more info)</a>
                            </span>
                        </h2>

                        <div>
                            <ul class="no-markers" aria-label="list of proposals">
                                <li v-for="(item, index) in ballot.proposals" :key="`bltprop${index}`">
                                    <label class="option small">
                                        <input v-model="proposal" type="radio" name="proposal" :value="item.id" />
                                        <span class="radio"></span> {{ item.name }}
                                    </label>
                                </li>
                            </ul>
                            <f-message v-if="proposalErrorMsg" type="error" with-icon>{{ proposalErrorMsg }}</f-message>
                        </div>

                        <div class="align-center form-buttons">
                            <button type="submit" class="btn large">Vote</button>
                        </div>
                    </div>
                </fieldset>
            </f-form>
        </f-card>
    </div>
</template>

<script>
import FForm from '../../core/FForm/FForm.vue';
import FCard from '../../core/FCard/FCard.vue';
import FMessage from '../../core/FMessage/FMessage.vue';

export default {
    name: 'BallotForm',

    components: { FMessage, FCard, FForm },

    props: {
        /** Ballot data object. */
        ballot: {
            type: Object,
            default() {
                return {};
            },
            required: true,
        },
    },

    data() {
        return {
            proposal: -1,
            proposalErrorMsg: '',
        };
    },

    watch: {
        proposal(_newValue) {
            if (_newValue > -1) {
                this.proposalErrorMsg = '';
            }
        },
    },

    methods: {
        onFormSubmit(_event) {
            if (this.proposal === -1) {
                this.proposalErrorMsg = 'Please select one of the options';
            } else {
                this.proposalErrorMsg = '';

                _event.detail.data.proposal = parseInt(_event.detail.data.proposal);
                _event.detail.data.ballot = this.ballot;

                this.$emit('f-form-submit', _event);
            }
        },

        onPreviousBtnClick() {
            this.$emit('change-component', {
                to: 'ballot-list',
                from: 'ballot-form',
            });
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
