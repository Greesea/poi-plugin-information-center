import _ from "lodash";
import React, {useState, useEffect} from "react";
import {connect} from "react-redux";
import {createSelector} from "reselect";
import {t} from "../../i18n.es";
import styled from "styled-components";

import {Tooltip} from "@blueprintjs/core";
import FA from "react-fontawesome"
import {constSelector, infoSelector, pluginSettingsSelector, pluginResourceSelector} from "../../../redux/selectors.es";
import {EXTENSION_KEY} from "../../constants.es";

const $Tab = styled.div``;

const selector = createSelector(
    [constSelector, infoSelector, pluginResourceSelector],
    (constData, info, resource) => {
        return {
            resource,
        };
    }
);
const mapStateToProps = state => selector(state);
const mapDispatchToProps = dispatch => ({});

const tab = connect(mapStateToProps, mapDispatchToProps)(function (props) {
    return (
        <$Tab>
            quests
        </$Tab>
    )
});

export default {
    id: "quests",
    title: t("root.tabs.quests"),
    panel: tab,
}
