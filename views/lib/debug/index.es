import kckit from "kckit";
import {matcher, parseMatcherRules} from "../matcher/index.es";
import {EXTENSION_KEY} from "../../constants.es";

window.__debug_clear_pluginSettings = () => window.config.set(`plugin.${EXTENSION_KEY}.pluginSettings`, {});
window.__debug_kckit = kckit;
window.__debug_parseMatcherRules = parseMatcherRules;
window.__debug_matcher = matcher;
window.__debug_state = 1;
