import commonTab from "./common/index";
import shipsTab from "./ships/index";
import equipmentsTab from "./equipments/index";
import questsTab from "./quests/index";
import settingsTab from "./settings/index";

export const tabs = {
    "common": commonTab,
    "ships": shipsTab,
    "equipments": equipmentsTab,
    "quests": questsTab,
    "settings": settingsTab,
}
export const tabsList = [tabs.common, tabs.ships, tabs.equipments, tabs.quests];
export const tabsIdList = [tabs.common.id, tabs.ships.id, tabs.equipments.id, tabs.quests.id];