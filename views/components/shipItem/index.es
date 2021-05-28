import _ from "lodash";
import React, {useState, useEffect} from "react";
import {t} from "../../i18n.es";
import styled from "styled-components";

import {Tooltip} from "views/components/etc/overlay";
import {Avatar} from "views/components/etc/avatar";
import {getShipAvatarColorByTag} from "views/utils/game-utils";
// import {} from "@blueprintjs/core";

import {LANGUAGE, RES} from "../../constants.es";

const $ShipItem = styled.div`
    position: relative;
    display: flex;

    margin-bottom: 4px;
    padding-right: 4px;
    height: 46px;
    background: rgba(0, 0, 0, 0.07);
    
    .bp3-dark & {
        background: rgba(0, 0, 0, 0.25);
        
        .basic {
            .name .name-lv, .suffix {
                color: #cccccc;
            }
        }
    }

    .accent {
        position: absolute;

        left: 0;
        top: 0;

        width: 100%;
        height: 100%;
        pointer-events: none;
    }

    .avatar {
        flex-shrink: 0;

        width: 86px;
    }

    .basic {
        display: flex;
        flex-flow: column;

        flex-grow: 1;
        flex-shrink: 1;

        .name {
            display: flex;
            flex-flow: row nowrap;

            overflow: hidden;

            .name-content {
                flex-shrink: 0;

                font-size: 20px;
                margin-right: 4px;
            }

            .name-lv {
                display: flex;
                flex-flow: column nowrap;

                flex-grow: 1;
                flex-shrink: 1;
                justify-content: flex-end;

                font-size: 12px;
                color: #666666;
            }
        }

        .suffix {
            color: #666666;
            font-size: 12px;
        }
    }

    .info {
        display: flex;
        flex-flow: row wrap;
        justify-content: space-between;

        flex-shrink: 0;
        width: 110px;

        & > .bp3-popover-wrapper {
            flex-basis: 48%;
            flex-shrink: 0;
        }

        .info-item {
            display: flex;
            flex-flow: row nowrap;
            align-items: center;

            .icon {
                width: 20px;
                height: 20px;
                overflow: hidden;

                img {
                    width: 100%;
                }
            }
        }
    }
`;

function ShipItem(props) {
    let item = props.item;
    let sallyColors = props.config?.fcdShipTagColor;

    return (
        <$ShipItem>
            {
                sallyColors && sallyColors.length && item.sally ?
                    <div className="accent" style={{background: `linear-gradient(to left, transparent, ${getShipAvatarColorByTag(item.sally, sallyColors)})`}}></div> :
                    <></>
            }

            <div className="avatar">
                <Avatar mstId={item.shipId} height={46}></Avatar>
            </div>
            <div className="basic">
                <div className="name">
                    <div className="name-content">{item.display.name}</div>
                    <div className="name-lv">
                        <span>Lv.{item.lv}</span>
                    </div>
                </div>
                <div className="suffix">{item.display.type} {item.display.class}</div>
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
        </$ShipItem>
    )
}

export default ShipItem;
