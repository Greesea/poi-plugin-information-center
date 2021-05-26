import _ from "lodash";
import Fuse from "../../../node_modules/fuse.js";
import React, {useState, useEffect} from "react";
import {connect} from "react-redux";
import {createSelector} from "reselect";
import {t} from "../../i18n.es";

import "./index.css";
import {Alert, Button, FormGroup, HTMLTable, InputGroup, Intent, Tooltip} from "@blueprintjs/core";
import AutoSizer from "react-virtualized/dist/commonjs/AutoSizer";
import List from "react-virtualized/dist/commonjs/List";
import ShipItem from "../../components/shipItem/index";

import {constSelector, infoSelector, pluginDataSelector, pluginSettingsSelector, pluginResourceSelector, fcdShipTagColorSelector} from "../../../redux/selectors.es";
import {compare} from "../../utils.es";
import {playerShipDataFactory} from "../../lib/dataFactory/ship.es";
import {matcher, matcherMarkupTypes, parseMatcherRules} from "../../lib/matcher/index.es";
import {EXTENSION_KEY, LANGUAGE, RES} from "../../constants.es";

const shipsSelector = createSelector([infoSelector], info => info.ships);

//region selector - ships
const shipMatcher = {
    enums: {
        mod4: {
            "4n": 0,
            "4n1": 1,
            "4n2": 2,
            "4n3": 3,
        },
        speed: {
            "tei": 5,
            "teisoku": 5,
            "di": 5,
            "disu": 5,
            "slow": 5,

            "kou": 10,
            "kousoku": 10,
            "gao": 10,
            "gaosu": 10,
            "fast": 10,

            "kou+": 15,
            "kousoku+": 15,
            "gao+": 15,
            "gaosu+": 15,
            "fast+": 15,

            "sai": 20,
            "saisoku": 20,
            "zui": 20,
            "zuisu": 20,
            "fastest": 20,
        },
        range: {
            "tan": 1,
            "duan": 1,
            "short": 1,

            "chuu": 2,
            "zhong": 2,
            "mid": 2,

            "cho": 3,
            "naga": 3,
            "chang": 3,
            "long": 3,

            "chocho": 4,
            "chonaga": 4,
            "chao": 4,
            "chaochang": 4,
            "verylong": 4,
        },
    },
    extractors: {
        [matcherMarkupTypes.brackets]: (pool, ruleItem) => {
            let content = ruleItem.content;
            let fuzzy = content.startsWith("*");
            if (fuzzy)
                content = content.substring(1);

            return new Fuse(pool, {
                keys: ["search.shipType"],
                minMatchCharLength: content.length,
                useExtendedSearch: true,
            }).search(`${fuzzy ? "'" : "="}"${content}"`).map(resultItem => resultItem.item);
        },
        [matcherMarkupTypes.chevrons]: (pool, ruleItem) => {
            let content = ruleItem.content;
            let fuzzy = content.startsWith("*");
            if (fuzzy)
                content = content.substring(1);

            return new Fuse(pool, {
                keys: ["search.shipClass"],
                minMatchCharLength: content.length,
                useExtendedSearch: true,
            }).search(`${fuzzy ? "'" : "="}"${content}"`).map(resultItem => resultItem.item);
        },
        // [matcherMarkupTypes.plain]: (pool, ruleItem) =>
        //     new Fuse(pool, {
        //         keys: ["search.shipName"]
        //     }).search(ruleItem.content).map(resultItem => resultItem.item),
        [matcherMarkupTypes.plain]: (pool, ruleItem) => {
            let content = ruleItem.content;
            let fuzzy = content.startsWith("*");
            if (fuzzy)
                content = content.substring(1);

            return new Fuse(pool, {
                keys: ["search.shipName"],
                minMatchCharLength: content.length,
                useExtendedSearch: true,
            }).search(`${fuzzy ? "'" : "="}"${content}"`).map(resultItem => resultItem.item);
        },
        [matcherMarkupTypes.compare]: (pool, ruleItem) => {
            let compareItem = ruleItem.compare;
            return _.filter(pool, item => {
                let attr = compareItem.attr.split(":").map(str => str.trim());
                attr[0] = (attr[0] ?? "").toLowerCase();

                switch (attr[0]) {
                    case "lv":
                    case "cond":
                        if (compareItem.value == null || compareItem.value === "")
                            return;
                        return compare(item[attr[0]], _.toNumber(compareItem.value), compareItem.operator);
                    case "locked":
                        return compare(item.locked, 1, compareItem.operator, compareItem.isNotEqualTag);
                    case "hp":
                        if (compareItem.value == null)
                            return;
                        switch (attr[1]) {
                            case "max":
                                return compare(item.hp[attr[1]], _.toNumber(compareItem.value), compareItem.operator);
                            default:
                                return compare(item.hp.value, _.toNumber(compareItem.value), compareItem.operator);
                        }

                    //region fire
                    case "ka":
                    case "karyoku":
                    case "huo":
                    case "huoli":
                    case "fire":
                        if (compareItem.value == null || compareItem.value === "")
                            return;
                        switch (attr[1]) {
                            case "default":
                            case "max":
                                return compare(item.fire[attr[1]], _.toNumber(compareItem.value), compareItem.operator);
                            default:
                                return compare(item.fire.value, _.toNumber(compareItem.value), compareItem.operator);
                        }
                    //endregion
                    //region torpedo
                    case "rai":
                    case "raisou":
                    case "lei":
                    case "leizhuang":
                    case "torpedo":
                        if (compareItem.value == null || compareItem.value === "")
                            return;
                        switch (attr[1]) {
                            case "default":
                            case "max":
                                return compare(item.torpedo[attr[1]], _.toNumber(compareItem.value), compareItem.operator);
                            default:
                                return compare(item.torpedo.value, _.toNumber(compareItem.value), compareItem.operator);
                        }
                    //endregion
                    //region aa
                    case "kuu":
                    case "taiku":
                    case "kong":
                    case "duikong":
                    case "aa":
                        if (compareItem.value == null || compareItem.value === "")
                            return;
                        switch (attr[1]) {
                            case "default":
                            case "max":
                                return compare(item.aa[attr[1]], _.toNumber(compareItem.value), compareItem.operator);
                            default:
                                return compare(item.aa.value, _.toNumber(compareItem.value), compareItem.operator);
                        }
                    //endregion
                    //region asw
                    case "sen":
                    case "taisen":
                    case "qian":
                    case "duiqian":
                    case "asw":
                        if (compareItem.value == null || compareItem.value === "")
                            return;
                        switch (attr[1]) {
                            case "default":
                            case "max":
                                return compare(item.asw[attr[1]], _.toNumber(compareItem.value), compareItem.operator);
                            default:
                                return compare(item.asw.value, _.toNumber(compareItem.value), compareItem.operator);
                        }
                    //endregion
                    //region armor
                    case "soukou":
                    case "jia":
                    case "zhuangjia":
                    case "armor":
                        if (compareItem.value == null || compareItem.value === "")
                            return;
                        switch (attr[1]) {
                            case "default":
                            case "max":
                                return compare(item.armor[attr[1]], _.toNumber(compareItem.value), compareItem.operator);
                            default:
                                return compare(item.armor.value, _.toNumber(compareItem.value), compareItem.operator);
                        }
                    //endregion
                    //region evasion
                    case "kaihi":
                    case "huibi":
                    case "evasion":
                        if (compareItem.value == null || compareItem.value === "")
                            return;
                        switch (attr[1]) {
                            case "default":
                            case "max":
                                return compare(item.evasion[attr[1]], _.toNumber(compareItem.value), compareItem.operator);
                            default:
                                return compare(item.evasion.value, _.toNumber(compareItem.value), compareItem.operator);
                        }
                    //endregion
                    //region luck
                    case "un":
                    case "yun":
                    case "luck":
                        if (compareItem.value == null || compareItem.value === "")
                            return;
                        switch (attr[1]) {
                            case "default":
                            case "max":
                                return compare(item.luck[attr[1]], _.toNumber(compareItem.value), compareItem.operator);
                            default:
                                return compare(item.luck.value, _.toNumber(compareItem.value), compareItem.operator);
                        }
                    //endregion

                    //region 4n
                    case "4n":
                    case "4n1":
                    case "4n2":
                    case "4n3":
                        return compare(item.hp.mod4, shipMatcher.enums.mod4[attr[0]], compareItem.operator, compareItem.isNotEqualTag);
                    //endregion
                    //region speed
                    case "tei":
                    case "teisoku":
                    case "di":
                    case "disu":
                    case "slow":
                    case "kou":
                    case "kousoku":
                    case "gao":
                    case "gaosu":
                    case "fast":
                    case "kou+":
                    case "kousoku+":
                    case "gao+":
                    case "gaosu+":
                    case "fast+":
                    case "sai":
                    case "saisoku":
                    case "zui":
                    case "zuisu":
                    case "fastest":
                        switch (attr[1]) {
                            case "default":
                                return compare(item.speed[attr[1]], shipMatcher.enums.speed[attr[0]], compareItem.operator, compareItem.isNotEqualTag);
                            default:
                                return compare(item.speed.value, shipMatcher.enums.speed[attr[0]], compareItem.operator, compareItem.isNotEqualTag);
                        }
                    //endregion
                    //region range
                    case "tan":
                    case "duan":
                    case "short":
                    case "chuu":
                    case "zhong":
                    case "mid":
                    case "cho":
                    case "naga":
                    case "chang":
                    case "long":
                    case "chocho":
                    case "chonaga":
                    case "chao":
                    case "chaochang":
                    case "verylong":
                        switch (attr[1]) {
                            case "default":
                                return compare(item.range[attr[1]], shipMatcher.enums.range[attr[0]], compareItem.operator, compareItem.isNotEqualTag);
                            default:
                                return compare(item.range.value, shipMatcher.enums.range[attr[0]], compareItem.operator, compareItem.isNotEqualTag);
                        }
                    //endregion
                    //region navy
                    case "ijn":
                    case "km":
                    case "rm":
                    case "mn":
                    case "rn":
                    case "usn":
                    case "vmf":
                    case "ran":
                    case "rnln":
                    case "rocn":
                        return compare(item.navy, attr[0], compareItem.operator, compareItem.isNotEqualTag);
                    //endregion
                }
            });
        },
    }
};
const playerShipsSelector = createSelector([shipsSelector], ships => _.map(ships, item => playerShipDataFactory(item)));
const searchBarInputSelector = createSelector([pluginDataSelector], pluginData => _.get(pluginData, "cache.ships.searchBarInput"))
const playerShipsMatchByRulesSelector = createSelector([playerShipsSelector, searchBarInputSelector], (playerShips, searchBarInput) => {
    return _.flatten(
        _.reduce(
            matcher(playerShips, {
                rules: parseMatcherRules(searchBarInput),
                extractors: shipMatcher.extractors,
            }),
            (storage, item) => {
                if (!storage.mapping[item.shipId]) {
                    storage.mapping[item.shipId] = [];
                    storage.array.push(storage.mapping[item.shipId]);
                }

                storage.mapping[item.shipId].push(item);

                return storage;
            },
            {mapping: {}, array: []}
        ).array
    );
});
//endregion

const selector = createSelector(
    [constSelector, infoSelector, searchBarInputSelector, playerShipsMatchByRulesSelector, fcdShipTagColorSelector],
    (constData, info, searchBarInput, matchedShips, fcdShipTagColor) => {
        return {
            searchBarInput,
            matchedShips,
            shipRenderConfig: {
                fcdShipTagColor,
            },
        };
    }
);
const mapStateToProps = state => selector(state);
const mapDispatchToProps = dispatch => ({
    updateSearchBarInput: text => dispatch({type: `@@${EXTENSION_KEY}@__tabData__`, tab: "ships", data: {searchBarInput: text}}),
});

const tab = connect(mapStateToProps, mapDispatchToProps)(function (props) {
    let [searchExtraButtonCheatsheetState, setSearchExtraButtonCheatsheetState] = useState(0);
    let [searchExtraButtonBasicState, setSearchExtraButtonBasicState] = useState(0);
    let [searchExtraButtonAdvancedState, setSearchExtraButtonAdvancedState] = useState(0);

    let searchExtraButtons = (
        <div>
            <Tooltip content={t("tabs.ships.searchExtraButtons.cheatsheetButton.text")}>
                <Button icon={"th"} minimal={true} onClick={() => {
                    setSearchExtraButtonCheatsheetState(1);
                }}/>
            </Tooltip>
            <Tooltip content={t("tabs.ships.searchExtraButtons.helpButton.text")}>
                <Button icon={"help"} minimal={true} onClick={() => {
                    setSearchExtraButtonBasicState(1);
                }}/>
            </Tooltip>
        </div>
    );
    let listRowItem = ({index, isScrolling, isVisible, key, parent, style}) => {
        return (
            <div key={key} style={style}>
                <ShipItem item={props.matchedShips[index]} config={props.shipRenderConfig}/>
            </div>
        )
    };

    return (
        <div className={`plugin-root-tabs-item-ships`}>
            <Alert
                isOpen={searchExtraButtonCheatsheetState}
                canEscapeKeyCancel={true}
                canOutsideClickCancel={true}
                confirmButtonText={t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.closeButton")}
                onClose={() => {
                    setSearchExtraButtonCheatsheetState(0);
                }}
            >
                <table className={"bp3-html-table bp3-interactive bp3-small bp3-html-table-bordered"} style={{tableLayout: "fixed"}}>
                    <thead>
                    <tr>
                        <th style={{width: "20%"}}>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.header.name")}</th>
                        <th style={{width: "40%"}}>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.header.attributeName")}</th>
                        <th style={{width: "20%"}}>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.header.type")}</th>
                        <th style={{width: "20%"}}>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.header.others")}</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.rows.lv")}</td>
                        <td>lv</td>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.type.compare")}</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.rows.cond")}</td>
                        <td>cond</td>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.type.compare")}</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.rows.locked")}</td>
                        <td>locked</td>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.type.tag")}</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.rows.hp")}</td>
                        <td>hp</td>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.type.compare")}</td>
                        <td>max</td>
                    </tr>
                    <tr>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.rows.fire")}</td>
                        <td>ka, karyoku, huo, huoli, fire</td>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.type.compare")}</td>
                        <td>default, max</td>
                    </tr>
                    <tr>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.rows.torpedo")}</td>
                        <td>rai, raisou, lei, leizhuang, torpedo</td>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.type.compare")}</td>
                        <td>default, max</td>
                    </tr>
                    <tr>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.rows.aa")}</td>
                        <td>kuu, taiku, kong, duikong, aa</td>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.type.compare")}</td>
                        <td>default, max</td>
                    </tr>
                    <tr>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.rows.asw")}</td>
                        <td>sen, taisen, qian, duiqian, asw</td>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.type.compare")}</td>
                        <td>default, max</td>
                    </tr>
                    <tr>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.rows.armor")}</td>
                        <td>soukou, jia, zhuangjia, armor</td>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.type.compare")}</td>
                        <td>default, max</td>
                    </tr>
                    <tr>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.rows.evasion")}</td>
                        <td>kaihi, huibi, evasion</td>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.type.compare")}</td>
                        <td>default, max</td>
                    </tr>
                    <tr>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.rows.luck")}</td>
                        <td>un, yun, luck</td>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.type.compare")}</td>
                        <td>default, max</td>
                    </tr>
                    <tr>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.rows.4n")}</td>
                        <td>4n</td>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.type.tag")}</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.rows.4n1")}</td>
                        <td>4n1</td>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.type.tag")}</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.rows.4n2")}</td>
                        <td>4n2</td>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.type.tag")}</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.rows.4n3")}</td>
                        <td>4n3</td>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.type.tag")}</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.rows.slow")}</td>
                        <td>tei, teisoku, di, disu, slow</td>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.type.compare")}</td>
                        <td>default</td>
                    </tr>
                    <tr>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.rows.fast")}</td>
                        <td>kou, kousoku, gao, gaosu, fast</td>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.type.compare")}</td>
                        <td>default</td>
                    </tr>
                    <tr>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.rows.fast+")}</td>
                        <td>kou+, kousoku+, gao+, gaosu+, fast+</td>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.type.compare")}</td>
                        <td>default</td>
                    </tr>
                    <tr>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.rows.fastest")}</td>
                        <td>sai, saisoku, zui, zuisu, fastest</td>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.type.compare")}</td>
                        <td>default</td>
                    </tr>
                    <tr>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.rows.short")}</td>
                        <td>tan, duan, short</td>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.type.compare")}</td>
                        <td>default</td>
                    </tr>
                    <tr>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.rows.mid")}</td>
                        <td>chuu, zhong, mid</td>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.type.compare")}</td>
                        <td>default</td>
                    </tr>
                    <tr>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.rows.long")}</td>
                        <td>cho, naga, chang, long</td>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.type.compare")}</td>
                        <td>default</td>
                    </tr>
                    <tr>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.rows.verylong")}</td>
                        <td>chocho, chonaga, chao, chaochang, verylong</td>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.type.compare")}</td>
                        <td>default</td>
                    </tr>
                    <tr>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.rows.ijn")}</td>
                        <td>ijn</td>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.type.tag")}</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.rows.km")}</td>
                        <td>km</td>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.type.tag")}</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.rows.rm")}</td>
                        <td>rm</td>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.type.tag")}</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.rows.mn")}</td>
                        <td>mn</td>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.type.tag")}</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.rows.rn")}</td>
                        <td>rn</td>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.type.tag")}</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.rows.usn")}</td>
                        <td>usn</td>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.type.tag")}</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.rows.vmf")}</td>
                        <td>vmf</td>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.type.tag")}</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.rows.ran")}</td>
                        <td>ran</td>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.type.tag")}</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.rows.rnln")}</td>
                        <td>rnln</td>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.type.tag")}</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.rows.rocn")}</td>
                        <td>rocn</td>
                        <td>{t("tabs.ships.searchExtraButtons.cheatsheetButton.dialog.table.type.tag")}</td>
                        <td></td>
                    </tr>
                    </tbody>
                </table>
            </Alert>
            <Alert
                isOpen={searchExtraButtonBasicState}
                intent={Intent.PRIMARY}
                canEscapeKeyCancel={true}
                canOutsideClickCancel={true}
                confirmButtonText={t("tabs.ships.searchExtraButtons.helpButton.dialogs.basic.goAdvancedButton")}
                cancelButtonText={t("tabs.ships.searchExtraButtons.helpButton.dialogs.basic.closeButton")}
                onClose={() => {
                    setSearchExtraButtonBasicState(0);
                }}
                onConfirm={() => {
                    setSearchExtraButtonAdvancedState(1);
                }}
            >
                <p style={{whiteSpace: "pre-wrap"}}>{t("tabs.ships.searchExtraButtons.helpButton.dialogs.basic.content")}</p>
            </Alert>
            <Alert
                isOpen={searchExtraButtonAdvancedState}
                intent={Intent.PRIMARY}
                canEscapeKeyCancel={true}
                canOutsideClickCancel={true}
                confirmButtonText={t("tabs.ships.searchExtraButtons.helpButton.dialogs.advanced.goBasicButton")}
                cancelButtonText={t("tabs.ships.searchExtraButtons.helpButton.dialogs.advanced.closeButton")}
                onClose={() => {
                    setSearchExtraButtonAdvancedState(0);
                }}
                onConfirm={() => {
                    setSearchExtraButtonBasicState(1);
                }}
            >
                <p style={{whiteSpace: "pre-wrap"}}>{t("tabs.ships.searchExtraButtons.helpButton.dialogs.advanced.content")}</p>
            </Alert>

            <FormGroup className="search">
                <InputGroup
                    placeholder={t("tabs.ships.searchPlaceholder")}
                    value={props.searchBarInput}
                    onChange={event => props.updateSearchBarInput(event.target.value)}
                    rightElement={searchExtraButtons}
                />
            </FormGroup>
            <div className="list">
                <AutoSizer>
                    {({width, height}) => {
                        return (
                            <List
                                width={width}
                                height={height}
                                rowCount={props.matchedShips.length}
                                rowHeight={50}
                                rowRenderer={listRowItem}
                            />
                        )
                    }}
                </AutoSizer>
            </div>
        </div>
    )
});

export default {
    id: "ships",
    title: t("root.tabs.ships"),
    panel: tab,
}
