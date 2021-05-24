import _ from "lodash";
import React, {useState, useEffect} from "react";
import {connect} from "react-redux";
import {createSelector} from "reselect";

import "./index.css";
import {Tab, Tabs} from "@blueprintjs/core";
import {EXTENSION_KEY, pluginSettingsSelector} from "../redux/selectors.es";
import {tabs as ROOT_TABS, tabsIdList as ROOT_TABS_ID_LIST} from "./tabs/loader.es";

const pluginSettingsTabSettingsRootTabsSelector = createSelector([pluginSettingsSelector], settings => settings?.root?.tabs ?? ROOT_TABS_ID_LIST);
const selector = createSelector([pluginSettingsSelector, pluginSettingsTabSettingsRootTabsSelector], (settings, settingsRootTabs) => {
    let visibleTabsArray = _.reduce(
        (settingsRootTabs ?? []).concat("settings"),
        (array, panelId) => array.push(ROOT_TABS[panelId]) && array,
        [],
    );

    return {
        settings,
        tabState: {
            visibleTabs: visibleTabsArray,
            defaultSelectedTabId: (_.first(visibleTabsArray) ?? {}).id,
        },
    };
});
const mapStateToProps = state => selector(state);
const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(function (props) {
    return (
        <div className={`${EXTENSION_KEY}`}>
            <Tabs id={"rootTabs"} className={`plugin-root-tabs-container`} defaultSelectedTabId={props.tabState.defaultSelectedTabId} vertical={true} renderActiveTabPanelOnly={true}>
                {
                    props.tabState.visibleTabs.map(item =>
                        <Tab id={item.id} key={item.id} title={item.title} panel={<item.panel/>}/>
                    )
                }
            </Tabs>
        </div>
    )
})
