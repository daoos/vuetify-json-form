import {default as Control} from "./control.vue";
import {ArrayControlParser, JsonForm, setConfigUsingValidation} from "@aquarelle/json-form";

class Parser extends ArrayControlParser
{
    getSubValidationProperty(definition, form, data, validator)
    {
        return 'variantValidations';
    }

    getConfig(definition, form)
    {
        if (!definition.config.variantField) {
            definition.config.variantField = 'variant_name';
        }
        return definition.config;
    }

    getItems(definition, form)
    {
        if (!Array.isArray(definition.items)) {
            return [];
        }
        return definition.items.map(item => {
            item = {...item};
            if (!Array.isArray(item.items)) {
                item.items = [];
            }
            return item;
        });
    }
}

Control.install = function (Vue) {
    Vue.component(Control.name, Control);
    JsonForm.addControl('repeat-variants', new Parser(Control.name));
};

export default Control;
