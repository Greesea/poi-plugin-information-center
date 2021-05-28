import _ from "lodash";
import React, {useState, useEffect, useContext} from "react";
import {connect} from "react-redux";
import {createSelector} from "reselect";
import styled from "styled-components";

import {WindowEnv} from "views/components/etc/window-env";
import {Tab, Tabs} from "@blueprintjs/core";
import {pluginSettingsSelector} from "../redux/selectors.es";
import {tabs as ROOT_TABS, tabsIdList as ROOT_TABS_ID_LIST} from "./tabs/loader.es";
import {EXTENSION_KEY} from "./constants.es";
import {debugConsole} from "./lib/debug/index.es";

const $container = styled.div`
    width: 100%;
    height: 100%;
    
    #plugin-mountpoint & {
        padding: 4px;
        
        .bp3-dark & {
            background: #30404d;
        }
    }

    .plugin-root-tabs-container {
        width: 100%;
        height: 100%;

        .bp3-tab-list {
            width: 100px;
        }

        .bp3-tab-panel {
            width: 100%;
            overflow: auto;
        }

        ::-webkit-scrollbar {
            width: 8px;
        }

        ::-webkit-scrollbar-thumb {
            background: #a0a0a0;
        }
    }
`;

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
    const [initTrigger] = useState(0);
    const [tabsAnimateSwitch, setTabsAnimateSwitch] = useState(false);
    const window = useContext(WindowEnv).window;
    useEffect(() => {
        // window.document.body.addEventListener("load", () => {
        //     console.log("loaded");
        //     setTabsAnimateSwitch(true);
        // });
        setTimeout(() => setTabsAnimateSwitch(true), 1000);
    }, [initTrigger]);

    return (
        <$container>
            <Tabs
                id={"rootTabs"}
                animate={tabsAnimateSwitch}
                className={`plugin-root-tabs-container`}
                defaultSelectedTabId={props.tabState.defaultSelectedTabId}
                vertical={true}
                renderActiveTabPanelOnly={true}
            >
                {
                    props.tabState.visibleTabs.map(item =>
                        <Tab id={item.id} key={item.id} title={item.title} panel={<item.panel/>}/>
                    )
                }
            </Tabs>
        </$container>
    )
})
