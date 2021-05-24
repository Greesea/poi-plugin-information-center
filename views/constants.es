import _ from "lodash";
import {POI_ROOT} from "./utils.es";

export const LANGUAGE = (window.language || "").toLowerCase().replace("-", "_");

export const RES = {
    IMAGE_COMMON_ITEMICONS: "/kcs2/img/common/common_itemicons.png",
    IMAGE_SHIPS_HP: POI_ROOT("assets/img/slotitem/114.png"),
    IMAGE_SHIPS_LUCK: POI_ROOT("assets/img/slotitem/132.png"),
    IMAGE_SHIPS_FIRE: POI_ROOT("assets/img/slotitem/101.png"),
    IMAGE_SHIPS_TORPEDO: POI_ROOT("assets/img/slotitem/105.png"),
};
