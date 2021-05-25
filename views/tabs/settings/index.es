import _ from "lodash";
import React, {useState, useEffect} from "react";
import {connect} from "react-redux";
import {createSelector} from "reselect";
import {t} from "../../i18n.es";

import "./index.css";
import {Card, Elevation, Switch} from "@blueprintjs/core";
import {pluginSettingsSelector} from "../../../redux/selectors.es";
import {tabsList as ROOT_TABS_LIST, tabsIdList as ROOT_TABS_ID_LIST} from "../loader.es";
import {EXTENSION_KEY} from "../../constants.es";

const pluginSettingsTabSettingsRootTabsSelector = createSelector([pluginSettingsSelector], settings => settings?.root?.tabs ?? ROOT_TABS_ID_LIST);
const selector = createSelector([pluginSettingsSelector, pluginSettingsTabSettingsRootTabsSelector], (settings, settingsRootTabs) => ({
    settings,
    rootTabsList: _.map(ROOT_TABS_LIST, tab => ({
        state: _.includes(settingsRootTabs, tab.id),
        tab,
    })),
}));
const mapStateToProps = state => selector(state);
const mapDispatchToProps = dispatch => ({
    tabActiveSwitch: (direction, key) => dispatch({type: `@@${EXTENSION_KEY}@settings-tabsActiveSwitch`, direction, key}),
});

const tab = connect(mapStateToProps, mapDispatchToProps)(function (props) {
    return (
        <div className={`plugin-root-tabs-item-settings`}>
            <Card className={"plugin-settings-tabs"} elevation={Elevation.ONE}>
                <h4>{t("tabs.settings.toggleTabs.title")}</h4>
                <div>
                    {
                        props.rootTabsList.map(item =>
                            <Switch
                                key={item.tab.id}
                                label={item.tab.title}
                                checked={item.state}
                                onChange={() => props.tabActiveSwitch(item.state ? "remove" : "add", item.tab.id)}
                            />
                        )
                    }
                </div>
            </Card>
        </div>
    )
});

export default {
    id: "settings",
    title: t("root.tabs.settings"),
    panel: tab,
}
