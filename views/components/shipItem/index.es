import _ from "lodash";
import React, {useState, useEffect} from "react";
import {t} from "../../i18n.es";

import {Avatar} from "views/components/etc/avatar";
import {Tooltip} from "@blueprintjs/core";

import {LANGUAGE, RES} from "../../constants.es";

function ShipItem(props) {
    let item = props.item;

    return (
        <div className="shipItem">
            <div className="avatar">
                <Avatar mstId={item.shipId} height={46}></Avatar>
            </div>
            <div className="basic">
                <div className="name">
                    <div className="name-content">{item.ship.getName("", LANGUAGE)}</div>
                    <div className="name-lv">
                        <span>Lv.{item.lv}</span>
                    </div>
                </div>
                <div className="suffix">{item.shipType?.code ?? ""} {item.shipClass?.getName(LANGUAGE) ?? ""}</div>
            </div>
            <div className="info">
                <Tooltip content={t("components.shipItem.hp", item.hp)}>
                    <div className="info-item">
                        <div className="icon">
                            <img src={RES.IMAGE_SHIPS_HP}/>
                        </div>
                        <div className="value">{item.hp.value}</div>
                    </div>
                </Tooltip>
                <Tooltip content={t("components.shipItem.luck", item.luck)}>
                    <div className="info-item">
                        <div className="icon">
                            <img src={RES.IMAGE_SHIPS_LUCK}/>
                        </div>
                        <div className="value">{item.luck.value}</div>
                    </div>
                </Tooltip>
                <Tooltip content={t("components.shipItem.fire", item.fire)}>
                    <div className="info-item">
                        <div className="icon">
                            <img src={RES.IMAGE_SHIPS_FIRE}/>
                        </div>
                        <div className="value">{item.fire.value}</div>
                    </div>
                </Tooltip>
                <Tooltip content={t("components.shipItem.torpedo", item.torpedo)}>
                    <div className="info-item">
                        <div className="icon">
                            <img src={RES.IMAGE_SHIPS_TORPEDO}/>
                        </div>
                        <div className="value">{item.torpedo.value}</div>
                    </div>
                </Tooltip>
            </div>
        </div>
    )
}

export default ShipItem;
