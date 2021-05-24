import _ from "lodash";
import React, {useState, useEffect} from "react";
import {connect} from "react-redux";
import {createSelector} from "reselect";
import {t} from "../../i18n.es";

import "./index.css";
import {Tooltip} from "@blueprintjs/core";
import FA from "react-fontawesome"
import {EXTENSION_KEY, constSelector, infoSelector, pluginSettingsSelector, pluginResourceSelector} from "../../../redux/selectors.es";

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
        <div className={`plugin-root-tabs-item-equipments`}>
            equipments
        </div>
    )
});

export default {
    id: "equipments",
    title: t("root.tabs.equipments"),
    panel: tab,
}