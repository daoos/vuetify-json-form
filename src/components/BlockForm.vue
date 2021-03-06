<template>
    <v-card :style="heightStyle" :flat="flat">
        <v-card-title v-if="title !== null || subtitle !== null" primary-title>
            <div>
                <div v-if="title !== null" class="headline">{{title}}</div>
                <div v-if="subtitle !== null">{{subtitle}}</div>
            </div>
        </v-card-title>
        <v-card-text>
            <json-form-group
                    v-if="value !== null && items !== null"
                    :items="parsed.items"
                    :model="value"
                    :validator="$v.value"
                    :json-form-wrapper="me"
                    ref="formGroup"
            ></json-form-group>
        </v-card-text>
        <v-card-actions>
            <slot v-bind="submitProps" :submit-disabled="processing || $v.$pending || ($v.$dirty && $v.$invalid)">
                <v-spacer></v-spacer>
                <v-btn color="primary"
                       :disabled="processing || $v.$pending || ($v.$dirty && $v.$invalid)"
                       :loading="processing"
                       @click.stop="submitProps.submit()">
                    {{submitButton}}
                </v-btn>
            </slot>
        </v-card-actions>
        <!-- Dialogs -->
        <dialog-forms ref="dialogs"></dialog-forms>
    </v-card>
</template>
<script>
    import {JsonFormGroup, validationMixin} from "@aquarelle/json-form";
    import DialogForms from "./DialogForms.vue";

    export default {
        name: 'block-form',
        components: {JsonFormGroup, DialogForms},
        mixins: [validationMixin],
        props: {
            value: {
                type: [Object, Array],
                default: null
            },
            items: {
                type: Array,
                default: null
            },
            title: {
                type: String,
                default: null
            },
            subtitle: {
                type: String,
                default: null
            },
            submitButton: {
                type: String,
                default: 'Submit'
            },
            fillHeight: {
                type: Boolean,
                default: false
            },
            processing: {
                type: Boolean,
                default: false
            },
            flat: {
                type: Boolean,
                default: false
            }
        },
        data()
        {
            return {
                me: this,
                submitProps: {
                    form: this,
                    validate: () => {
                        this.$v.$touch();
                    },
                    reset: () => {
                        this.$v.$reset();
                    },
                    submit: () => {
                        const v = this.$v;
                        v.$touch();
                        if (!v.$invalid && !v.$pending) {
                            this.$emit('submit', this.value);
                        }
                    },
                    invalid: () => {
                        return this.$v.$invalid;
                    },
                    pending: () => {
                        return this.$v.$pending;
                    },
                    dirty: () => {
                        return this.$v.$dirty;
                    }
                }
            };
        },
        computed: {
            heightStyle()
            {
                return this.fillHeight ? {height: '100%'} : undefined;
            },
            parsed()
            {
                if (this.items === null) {
                    return null;
                }
                const validator = {};
                const items = this.$jsonForm.parseControlList(this.items, validator);
                return {
                    items,
                    validator
                };
            },
        },
        validations()
        {
            if (this.value === null || this.items === null) {
                return true;
            }
            return {value: this.parsed.validator};
        },
        methods: {
            pushUnparsedForm(options, model)
            {
                this.$refs.dialogs.pushUnparsedForm(options, model);
            },
            pushForm(options)
            {
                this.$refs.dialogs.pushForm(options);
            },
            popForm()
            {
                this.$refs.dialogs.popForm();
                if (this.$v) {
                    this.$v.$touch();
                }
            },
            onRouteLeave(func)
            {
                if (this.processing || !func(this.$refs.dialogs)) {
                    return false;
                }

                return func(this.$refs.formGroup);
            }
        }
    };
</script>