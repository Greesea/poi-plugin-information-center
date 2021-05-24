import i18next from "views/env-parts/i18next";

// export const __t = i18next.getFixedT("en-US", "poi-plugin-information-center");
export const __t = i18next.getFixedT(null, "poi-plugin-information-center");
export const t = (key, options = null, fallback) => {
    let result = __t(key, options);
    return result === key ? fallback : result;
};
