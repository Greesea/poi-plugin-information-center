// kckit/src/parse-raw.js

import _ from "lodash";
import ClassBase from "kckit/src/class/base";
import Ship from "kckit/src/class/ship"
import Equipment from "kckit/src/class/equipment"
import Entity from "kckit/src/class/entity"
import Consumable from "kckit/src/class/consumable"
import ExillustType from "kckit/src/class/exillust-type"

const cloneTypes = {
    "item_types": "item-types",
    "equipment_types": "equipment-types",
    "ship_classes": "ship-classes",
    "ship_types": "ship-types",
};
const skipTypes = ["arsenal_all", "arsenal_weekday"];

export default (raw = {}, db = {}) => {
    for (let type in raw) {
        let Class
        if (skipTypes.indexOf(type) > -1)
            continue;

        switch (type) {
            case 'ships': Class = Ship; break;

            case 'items':
            case 'equipments': Class = Equipment; break;

            case 'entities': Class = Entity; break;

            case 'consumables': Class = Consumable; break;

            case 'exillustTypes':
            case 'exillust_types':
            case 'exillust-types': Class = ExillustType; break;

            default: Class = ClassBase; break;
        }

        let fn = (setType => {
            _.forEach(raw[type], item => {
                if (!item) return
                if (typeof db[setType] === 'undefined') db[setType] = {}

                const obj = item
                const id = typeof obj.id !== 'undefined' ? parseInt(obj.id) : obj._id

                if (Class) {
                    db[setType][id] = new Class(obj)
                } else {
                    db[setType][id] = obj
                }
            })
        });

        fn(type);
        if (cloneTypes[type])
            fn(cloneTypes[type]);
    }

    return db
}
