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
import {debugConsole} from "../../lib/debug/index.es";

const shipsSelector = createSelector([infoSelector], info => info.ships);

//region selector - ships
const shipMatcher = {
    enums: {
        attributes: {
            id: 1,
            lv: 2,
            cond: 3,
            slot: 4,
            event: 5,

            hp: 6,
            fire: 7,
            torpedo: 8,
            aa: 9,
            asw: 10,
            armor: 11,
            evasion: 12,
            luck: 13,

            lock: 14,
            "4n": 15,
            speed: 16,
            range: 17,
            navy: 18,
        },

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
    featureConfig: {
        compareAndTags: {
            functionGenerator: {
                compareByAttr: (valueAttr) => {
                    return (ruleItem, compareItem, item, attr) => {
                        if (compareItem.value == null || compareItem.value === "")
                            return;
                        return compare(item[valueAttr], _.toNumber(compareItem.value), compareItem.operator);
                    }
                },
                compareByAttrWithDefaultAndMax: (valueAttr) => {
                    return (ruleItem, compareItem, item, attr) => {
                        if (compareItem.value == null)
                            return;
                        switch (attr[1]) {
                            case "default":
                            case "max":
                                return compare(item[valueAttr][attr[1]], _.toNumber(compareItem.value), compareItem.operator);
                            default:
                                return compare(item[valueAttr].value, _.toNumber(compareItem.value), compareItem.operator);
                        }
                    }
                },
                tagByAttrAndEnum: (valueAttr, enumAttr = valueAttr) => {
                    return (ruleItem, compareItem, item, attr) => {
                        switch (attr[1]) {
                            case "default":
                                return compare(item[valueAttr][attr[1]], shipMatcher.enums[enumAttr][attr[0]], compareItem.operator, compareItem.isNotEqualTag);
                            default:
                                return compare(item[valueAttr].value, shipMatcher.enums[enumAttr][attr[0]], compareItem.operator, compareItem.isNotEqualTag);
                        }
                    }
                },
            },
        },
    },
};
shipMatcher.enums.attributeAlias = {
    [shipMatcher.enums.attributes.id]: ["id"],
    [shipMatcher.enums.attributes.lv]: ["lv"],
    [shipMatcher.enums.attributes.cond]: ["cond"],
    [shipMatcher.enums.attributes.slot]: ["slot"],
    [shipMatcher.enums.attributes.event]: ["event"],

    [shipMatcher.enums.attributes.hp]: ["hp"],
    [shipMatcher.enums.attributes.fire]: ["ka", "karyoku", "huo", "huoli", "fire"],
    [shipMatcher.enums.attributes.torpedo]: ["rai", "raisou", "lei", "leizhuang", "torpedo"],
    [shipMatcher.enums.attributes.aa]: ["kuu", "taiku", "kong", "duikong", "aa"],
    [shipMatcher.enums.attributes.asw]: ["sen", "taisen", "qian", "duiqian", "asw"],
    [shipMatcher.enums.attributes.armor]: ["soukou", "jia", "zhuangjia", "armor"],
    [shipMatcher.enums.attributes.evasion]: ["kaihi", "huibi", "evasion"],
    [shipMatcher.enums.attributes.luck]: ["un", "yun", "luck"],

    [shipMatcher.enums.attributes.lock]: ["lock", "locked"],
    [shipMatcher.enums.attributes["4n"]]: ["4n", "4n1", "4n2", "4n3"],
    [shipMatcher.enums.attributes.speed]: ["tei", "teisoku", "di", "disu", "slow", "kou", "kousoku", "gao", "gaosu", "fast", "kou", "kousoku", "gao", "gaosu", "fast", "sai", "saisoku", "zui", "zuisu", "fastest"],
    [shipMatcher.enums.attributes.range]: ["tan", "duan", "short", "chuu", "zhong", "mid", "cho", "naga", "chang", "long", "chocho", "chonaga", "chao", "chaochang", "verylong"],
    [shipMatcher.enums.attributes.navy]: ["ijn", "km", "rm", "mn", "rn", "usn", "vmf", "ran", "rnln", "rocn"],
};
shipMatcher.enums.attributeAliasToAttribute = (() => _.reduce(shipMatcher.enums.attributeAlias, (obj, value, key) => {
    _.forEach(value, aliasItem => {
        obj[aliasItem] = key;
    });
    return obj;
}, {}))();
shipMatcher.featureConfig.compareAndTags.mapping = {
    [shipMatcher.enums.attributes.id]: shipMatcher.featureConfig.compareAndTags.functionGenerator.compareByAttr("id"),
    [shipMatcher.enums.attributes.lv]: shipMatcher.featureConfig.compareAndTags.functionGenerator.compareByAttr("lv"),
    [shipMatcher.enums.attributes.cond]: shipMatcher.featureConfig.compareAndTags.functionGenerator.compareByAttr("cond"),
    [shipMatcher.enums.attributes.slot]: (ruleItem, compareItem, item, attr) => {
        if (compareItem.value == null || compareItem.value === "")
            return;
        return compare(item.ship?.slot?.length ?? 0, _.toNumber(compareItem.value), compareItem.operator);
    },
    [shipMatcher.enums.attributes.event]: (ruleItem, compareItem, item, attr) => {
        if (compareItem.value == null || compareItem.value === "")
            return;
        return compare(item.sally, _.toNumber(compareItem.value), compareItem.operator);
    },

    [shipMatcher.enums.attributes.hp]: shipMatcher.featureConfig.compareAndTags.functionGenerator.compareByAttrWithDefaultAndMax("hp"),
    [shipMatcher.enums.attributes.fire]: shipMatcher.featureConfig.compareAndTags.functionGenerator.compareByAttrWithDefaultAndMax("fire"),
    [shipMatcher.enums.attributes.torpedo]: shipMatcher.featureConfig.compareAndTags.functionGenerator.compareByAttrWithDefaultAndMax("torpedo"),
    [shipMatcher.enums.attributes.aa]: shipMatcher.featureConfig.compareAndTags.functionGenerator.compareByAttrWithDefaultAndMax("aa"),
    [shipMatcher.enums.attributes.asw]: shipMatcher.featureConfig.compareAndTags.functionGenerator.compareByAttrWithDefaultAndMax("asw"),
    [shipMatcher.enums.attributes.armor]: shipMatcher.featureConfig.compareAndTags.functionGenerator.compareByAttrWithDefaultAndMax("armor"),
    [shipMatcher.enums.attributes.evasion]: shipMatcher.featureConfig.compareAndTags.functionGenerator.compareByAttrWithDefaultAndMax("evasion"),
    [shipMatcher.enums.attributes.luck]: shipMatcher.featureConfig.compareAndTags.functionGenerator.compareByAttrWithDefaultAndMax("luck"),

    [shipMatcher.enums.attributes.lock]: (ruleItem, compareItem, item, attr) => {
        return compare(item.locked, 1, compareItem.operator, compareItem.isNotEqualTag);
    },
    [shipMatcher.enums.attributes["4n"]]: (ruleItem, compareItem, item, attr) => {
        return compare(item.hp.mod4, shipMatcher.enums.mod4[attr[0]], compareItem.operator, compareItem.isNotEqualTag);
    },
    [shipMatcher.enums.attributes.speed]: shipMatcher.featureConfig.compareAndTags.functionGenerator.tagByAttrAndEnum("speed"),
    [shipMatcher.enums.attributes.range]: shipMatcher.featureConfig.compareAndTags.functionGenerator.tagByAttrAndEnum("range"),
    [shipMatcher.enums.attributes.navy]: (ruleItem, compareItem, item, attr) => {
        return compare(item.navy, attr[0], compareItem.operator, compareItem.isNotEqualTag);
    },
};

shipMatcher.extractors = {
    [matcherMarkupTypes.brackets]: (pool, ruleItem) => {
        let content = ruleItem.content;
        let searchPattern = "";
        let minLength = content.length;

        let firstChar = (content || "")[0];
        switch (firstChar) {
            case "'": // include match
            case "!": // inverse-exact match
                searchPattern = `${firstChar}"${content.substring(1)}"`;
                minLength--;
                break;
            case "*": // fuzzy match
                searchPattern = `"${content.substring(1)}"`;
                minLength--;
                break;
            default: // exact match
                searchPattern = `="${content}"`;
                break;
            case "$": // custom rule
                searchPattern = content.substring(1);
                minLength = 1;
                break;
        }

        return new Fuse(pool, {
            keys: ["search.shipType"],
            minMatchCharLength: minLength,
            useExtendedSearch: true,
        }).search(searchPattern).map(resultItem => resultItem.item);
    },
    [matcherMarkupTypes.chevrons]: (pool, ruleItem) => {
        let content = ruleItem.content;
        let searchPattern = "";
        let minLength = content.length;

        let firstChar = (content || "")[0];
        switch (firstChar) {
            case "'": // include match
            case "!": // inverse-exact match
                searchPattern = `${firstChar}"${content.substring(1)}"`;
                minLength--;
                break;
            case "*": // fuzzy match
                searchPattern = `"${content.substring(1)}"`;
                minLength--;
                break;
            default: // exact match
                searchPattern = `="${content}"`;
                break;
            case "$": // custom rule
                searchPattern = content.substring(1);
                minLength = 1;
                break;
        }

        return new Fuse(pool, {
            keys: ["search.shipClass"],
            minMatchCharLength: minLength,
            useExtendedSearch: true,
        }).search(searchPattern).map(resultItem => resultItem.item);
    },
    [matcherMarkupTypes.plain]: (pool, ruleItem) => {
        let content = ruleItem.content;
        let searchPattern = "";
        let minLength = content.length;

        let firstChar = (content || "")[0];
        switch (firstChar) {
            case "=": // exact match
            case "'": // include match
            case "!": // inverse-exact match
                searchPattern = `${firstChar}"${content.substring(1)}"`;
                minLength--;
                break;
            default: // fuzzy match
                searchPattern = `"${content}"`;
                break;
            case "$": // custom rule
                searchPattern = content.substring(1);
                minLength = 1;
                break;
        }

        return new Fuse(pool, {
            keys: ["search.shipName"],
            minMatchCharLength: minLength,
            useExtendedSearch: true,
        }).search(searchPattern).map(resultItem => resultItem.item);
    },
    [matcherMarkupTypes.compare]: (pool, ruleItem) => {
        let compareItem = ruleItem.compare;
        return _.filter(pool, item => {
            let attr = compareItem.attr.split(":").map(str => str.trim());
            attr[0] = (attr[0] ?? "").toLowerCase();

            let attributeType = shipMatcher.enums.attributeAliasToAttribute[attr[0]];
            if (!attributeType)
                return;
            return (shipMatcher.featureConfig.compareAndTags.mapping[attributeType] ?? _.noop)(ruleItem, compareItem, item, attr);
        });
    },
};

const playerShipsSelector = createSelector([shipsSelector], ships => _.map(ships, item => playerShipDataFactory(item)));
const searchBarInputSelector = createSelector([pluginDataSelector], pluginData => _.get(pluginData, "cache.ships.searchBarInput"))
const playerShipsMatchByRulesSelector = createSelector([playerShipsSelector, searchBarInputSelector], (playerShips, searchBarInput) => {
    //TODO add sort support

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
                        console.log(props.matchedShips);
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
