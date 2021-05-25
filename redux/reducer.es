import kckit from "kckit";
import kckitDataSource from "../views/lib/kckit/dataSource";

import {EXTENSION_KEY} from "../views/constants.es";
import {pluginSettingsSelector, pluginSettingsSet} from "./selectors.es";
import {createSelector} from "reselect";
import {tabsIdList as ROOT_TABS_ID_LIST} from "../views/tabs/loader.es";
import {debugConsole} from "../views/lib/debug/index.es";

//region tab-common
const pluginSettingsTabCommonUseItemsFavouritesSelector = createSelector([pluginSettingsSelector], settings => settings?.tabs?.common?.useItemsFavourites ?? []);
//endregion

//region tab-settings
const pluginSettingsTabSettingsRootTabsSelector = createSelector([pluginSettingsSelector], settings => settings?.root?.tabs ?? ROOT_TABS_ID_LIST);
//endregion

export default (state = {}, action, store) => {
    const {type} = action;

    debugConsole().log(`on action "${type}"`);

    //region core
    if (type === `@@${EXTENSION_KEY}@__update__`) {
        return (() => {
            const {init} = action;

            if (init?.wctf && !Object.keys(kckit?.db ?? {}).length) {
                let wctfClone = _.cloneDeep(init.wctf) ?? {};
                delete wctfClone.version;
                delete wctfClone.lastModified;
                kckit.register({
                    db: kckitDataSource(wctfClone),
                });
            }

            return {
                ...state,
                ...action.data,
            };
        })();
    }

    if (type === `@@${EXTENSION_KEY}@__tabData__`) {
        return (() => {
            const {tab} = action;
            return {
                ...state,
                cache: {
                    ...state.cache,
                    [tab]: {
                        ...action.data
                    },
                },
            };
        })();
    }
    //endregion

    //region tab-common
    if (type === `@@${EXTENSION_KEY}@common-switchUseItemsFavourite`) {
        return (() => {
            let {direction, id} = action;

            let array = pluginSettingsTabCommonUseItemsFavouritesSelector(store);
            switch (direction) {
                case "add":
                    array = [
                        ...array,
                        id,
                    ];
                    break;
                case "remove":
                    array = [
                        ..._.filter(array, value => value !== id),
                    ];
                    break;
            }

            pluginSettingsSet("tabs.common.useItemsFavourites", array);

            return {
                ...state,
            };
        })();
    }
    //endregion

    //region tab-settings
    if (type === `@@${EXTENSION_KEY}@settings-tabsActiveSwitch`) {
        return (() => {
            let {direction, key} = action;

            let array = pluginSettingsTabSettingsRootTabsSelector(store);
            switch (direction) {
                case "add":
                    array = [
                        ...array,
                        key,
                    ];
                    break;
                case "remove":
                    array = [
                        ..._.filter(array, value => value !== key),
                    ];
                    break;
            }

            pluginSettingsSet("root.tabs", array);

            return {
                ...state,
            };
        })();
    }
    //endregion

    return state
}
