import _ from "lodash";
import React, {useState, useEffect} from "react";
import {connect} from "react-redux";
import {createSelector} from "reselect";
import {t} from "../../i18n.es";

import "./index.css";
import {Tooltip} from "@blueprintjs/core";
import FA from "react-fontawesome"
import {EXTENSION_KEY, constSelector, infoSelector, pluginSettingsSelector, pluginResourceSelector} from "../../../redux/selectors.es";

//region 特殊处理
class ExtraInfoFurniture {
    singleValue = 0;
    iconPath = "resource.icons.useItems.common_itemicons_id_44";

    constructor(singleValue) {
        this.singleValue = singleValue;
    }

    getValue(count) {
        return _.round(this.singleValue * count);
    }

    fn(itemData) {
        let halfCount = _.floor((itemData.raw.item.api_count ?? 0) / 2);
        let fullValue = this.getValue(itemData.raw.item.api_count ?? 0);

        itemData.amount.push({
            icon: props => _.get(props, this.iconPath),
            value: fullValue,
            tooltip:
                <table className="plugin-root-tabs-item-common-useItemAmountFurniturePopover">
                    <tbody>
                    <tr className="item">
                        <td className="header">{t("tabs.common.furnitureAmount.1x.header", {number: 1, single: this.singleValue})}</td>
                        <td className="value">{t("tabs.common.furnitureAmount.1x.value", {value: this.singleValue})}</td>
                    </tr>
                    <tr className="item">
                        <td className="header">{t("tabs.common.furnitureAmount.10x.header", {number: 10, single: this.singleValue})}</td>
                        <td className="value">{t("tabs.common.furnitureAmount.10x.value", {value: this.getValue(10)})}</td>
                    </tr>
                    <tr className="item">
                        <td className="header">{t("tabs.common.furnitureAmount.half.header", {number: halfCount, single: this.singleValue})}</td>
                        <td className="value">{t("tabs.common.furnitureAmount.half.value", {value: this.getValue(halfCount)})}</td>
                    </tr>
                    <tr className="item">
                        <td className="header">{t("tabs.common.furnitureAmount.full.header", {number: itemData.raw.item.api_count ?? 0, single: this.singleValue})}</td>
                        <td className="value">{t("tabs.common.furnitureAmount.full.value", {value: fullValue})}</td>
                    </tr>
                    </tbody>
                </table>
        });

        return itemData;
    }
}

const extraInfoExceptObj = {except: true};
const extraInfo = {
    //region except
    79: extraInfoExceptObj,
    81: extraInfoExceptObj,
    82: extraInfoExceptObj,
    83: extraInfoExceptObj,
    84: extraInfoExceptObj,
    //endregion

    10: new ExtraInfoFurniture(200),
    11: new ExtraInfoFurniture(400),
    12: new ExtraInfoFurniture(700),
};
//endregion

const pluginSettingsTabCommonUseItemsFavouritesSelector = createSelector([pluginSettingsSelector], settings => settings?.tabs?.common?.useItemsFavourites ?? []);
const selector = createSelector(
    [constSelector, infoSelector, pluginResourceSelector, pluginSettingsTabCommonUseItemsFavouritesSelector],
    (constData, info, resource, useItemsFavourites) => {
        return {
            resource,
            useItems: _.orderBy(_.filter(_.map(info?.useitems, item => {
                if (!item)
                    return;
                let extra = extraInfo[item.api_id];
                let info = _.get(constData, `$useitems.${item.api_id}`);
                if (!info || extra?.except)
                    return;

                let sort = useItemsFavourites.indexOf(item.api_id);
                if (sort === -1)
                    sort = null;

                let itemData = {
                    id: item.api_id,
                    name: t(`translate.useItems.${item.api_id}`, null, info.api_name),
                    isFavourite: sort != null,
                    sort,
                    amount: [{
                        value: item.api_count ?? 0
                    }],

                    raw: {item, info},
                };
                if (extra)
                    itemData = extra.fn(itemData);

                return itemData;
            })), ["sort", "id"], ["asc", "asc"]),
        };
    }
);
const mapStateToProps = state => selector(state);
const mapDispatchToProps = dispatch => ({
    switchUseItemsFavourite: (direction, id) => dispatch({type: `@@${EXTENSION_KEY}@common-switchUseItemsFavourite`, direction, id}),
});

const AmountItem = function (props) {
    return (
        <div className="amount-item-content">
            <div className="amount-icon">
                <img src={(props.amountItem.icon && props.amountItem.icon(props.componentProps)) ?? props.componentProps.resource?.others?.port_skin_1_22}/>
            </div>
            <div className="amount-value">x{props.amountItem.value ?? 0}</div>
        </div>
    );
};
const tab = connect(mapStateToProps, mapDispatchToProps)(function (props) {
    return (
        <div className={`plugin-root-tabs-item-common`}>
            <div className="useItem-list">
                {
                    props.useItems.map(item =>
                        <div key={item.id} className="item">
                            <div className="icon">
                                <img src={_.get(props.resource?.icons?.useItems, `common_itemicons_id_${item.id}`)}/>
                            </div>
                            <div className="content">
                                <div className="title">
                                    <div className="title-name" title={item.name}>{item.name}</div>
                                    {
                                        item.isFavourite ?
                                            <div className="favourite active" title={t("tabs.common.favouriteButton.undo")} onClick={() => props.switchUseItemsFavourite("remove", item.id)}>
                                                <FA name="star"></FA>
                                            </div>
                                            :
                                            <div className="favourite" title={t("tabs.common.favouriteButton.text")} onClick={() => props.switchUseItemsFavourite("add", item.id)}>
                                                <FA name="star-o"></FA>
                                            </div>
                                    }
                                </div>
                                <div className="amount">
                                    {
                                        item.amount.map(amountItem =>
                                            amountItem.tooltip ?
                                                <Tooltip wrapperTagName="div" targetTagName="div" popoverClassName={`${EXTENSION_KEY}-overlay`} content={amountItem.tooltip} lazy={true}>
                                                    <AmountItem componentProps={props} amountItem={amountItem}/>
                                                </Tooltip>
                                                :
                                                <div className="amount-item">
                                                    <AmountItem componentProps={props} amountItem={amountItem}/>
                                                </div>
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    )
});

export default {
    id: "common",
    title: t("root.tabs.common"),
    panel: tab,
}