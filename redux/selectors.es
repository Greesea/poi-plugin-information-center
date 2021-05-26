import _ from "lodash";
import {createSelector} from "reselect";
import {
    stateSelector as poiStateSelector,
    constSelector as poiConstSelector,
    extensionSelectorFactory,
    fcdSelector as poiFcdSelector,
    fcdShipTagColorSelector as poiFcdShipTagColorSelector
} from "views/utils/selectors";
import {EXTENSION_KEY} from "../views/constants.es";

export const stateSelector = poiStateSelector;
export const constSelector = poiConstSelector;
export const fcdSelector = poiFcdSelector;
export const fcdShipTagColorSelector = poiFcdShipTagColorSelector;
export const infoSelector = state => state?.info;

export const pluginDataSelector = createSelector(extensionSelectorFactory(EXTENSION_KEY), state => state || {});
export const pluginDataSelectorFactory = (path, defaults) => createSelector(pluginDataSelector, state => _.get(state, path, defaults));
export const pluginResourceSelector = createSelector([pluginDataSelector], data => data?.resource);
export const pluginSettingsSelector = state => _.get(state, `config.plugin.${EXTENSION_KEY}.pluginSettings`);
export const pluginSettingsSet = (path, value) => window.config.set([`plugin.${EXTENSION_KEY}.pluginSettings`, path].join("."), value);
