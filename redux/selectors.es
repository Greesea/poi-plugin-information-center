import _ from "lodash";
import {createSelector} from "reselect";
import {stateSelector as poiStateSelector, constSelector as poiConstSelector, extensionSelectorFactory} from "views/utils/selectors";

export const EXTENSION_KEY = "poi-plugin-information-center";

export const stateSelector = poiStateSelector;
export const constSelector = poiConstSelector;
export const infoSelector = state => state?.info;

export const pluginDataSelector = createSelector(extensionSelectorFactory(EXTENSION_KEY), state => state || {});
export const pluginDataSelectorFactory = (path, defaults) => createSelector(pluginDataSelector, state => _.get(state, path, defaults));
export const pluginResourceSelector = createSelector([pluginDataSelector], data => data?.resource);
export const pluginSettingsSelector = state => _.get(state, `config.plugin.${EXTENSION_KEY}.pluginSettings`);
export const pluginSettingsSet = (path, value) => window.config.set([`plugin.${EXTENSION_KEY}.pluginSettings`, path].join("."), value);