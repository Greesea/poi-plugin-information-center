import kckit from "kckit";
import {LANGUAGE} from "../../constants.es";

export const playerShipDataFactory = playerShipRaw => {
    let data = Object.create(null);
    if (!playerShipRaw)
        return data;

    data.id = playerShipRaw.api_id;
    data.raw = playerShipRaw;
    data.shipId = playerShipRaw.api_ship_id;
    data.ship = kckit.get.ship(data.shipId);
    data.shipType = kckit.get.shipType(data.ship?.type);
    data.shipClass = kckit.get.shipClass(data.ship?.class);

    data.search = Object.create(null);
    data.search.shipName = _.uniq(
        _.filter(
            _.flatten(
                _.map(
                    Object.keys(data.ship.name),
                    key => key === "suffix" ? null : [data.ship.name[key], data.ship.getName("", key)]
                )
            )
        )
    );
    data.search.shipType = _.filter([data.shipType.code].concat(_.map(Object.keys(data.shipType.name), key => data.shipType.getName(key))));
    data.search.shipClass = _.filter(_.map(Object.keys(data.shipClass.name), key => data.shipClass.getName(key)));

    data.display = Object.create(null);
    data.display.name = data.ship.getName("", LANGUAGE);
    data.display.type = data.shipType?.code ?? "";
    data.display.class = data.shipClass?.getName(LANGUAGE) ?? "";

    data.lv = playerShipRaw.api_lv;
    data.cond = playerShipRaw.api_cond;
    data.locked = playerShipRaw.api_locked;
    data.navy = data.ship?.getNavy();

    data.sally = playerShipRaw.api_sally_area;

    data.hp = Object.create(null);
    data.hp.value = playerShipRaw.api_nowhp;
    data.hp.max = playerShipRaw.api_maxhp;
    data.hp.mod4 = data.hp.max % 4;
    data.speed = Object.create(null);
    data.speed.default = data.ship?.stat.speed ?? 0;
    data.speed.value = playerShipRaw.api_soku;
    data.range = Object.create(null);
    data.range.default = data.ship?.stat.range ?? 0;
    data.range.value = playerShipRaw.api_leng;

    data.fire = Object.create(null);
    data.fire.value = playerShipRaw.api_karyoku[0];
    data.fire.default = data.ship?.stat.fire;
    data.fire.max = data.ship?.stat.fire_max;
    data.torpedo = Object.create(null);
    data.torpedo.value = playerShipRaw.api_raisou[0];
    data.torpedo.default = data.ship?.stat.torpedo;
    data.torpedo.max = data.ship?.stat.torpedo_max;
    data.aa = Object.create(null);
    data.aa.value = playerShipRaw.api_taiku[0];
    data.aa.default = data.ship?.stat.aa;
    data.aa.max = data.ship?.stat.aa_max;
    data.asw = Object.create(null);
    data.asw.value = playerShipRaw.api_taisen[0];
    data.asw.default = data.ship?.stat.asw;
    data.asw.max = data.ship?.stat.asw_max;
    data.armor = Object.create(null);
    data.armor.value = playerShipRaw.api_soukou[0];
    data.armor.default = data.ship?.stat.armor;
    data.armor.max = data.ship?.stat.armor_max;
    data.evasion = Object.create(null);
    data.evasion.value = playerShipRaw.api_kaihi[0];
    data.evasion.default = data.ship?.stat.evasion;
    data.evasion.max = data.ship?.stat.evasion_max;
    data.luck = Object.create(null);
    data.luck.value = playerShipRaw.api_lucky[0];
    data.luck.default = data.ship?.stat.luck;
    data.luck.max = data.ship?.stat.luck_max;

    return data;
}
