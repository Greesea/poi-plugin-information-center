import _ from "lodash";

export const matcherMarkupTypes = {
    parentheses: 1,// ()
    braces: 2,// {}
    brackets: 3,// []
    chevrons: 4,// <>
    plain: 5,

    compare: 10,
};
const bracketGroup = {
    "(": {
        prefix: "(",
        suffix: ")",
        type: matcherMarkupTypes.parentheses
    },
    "{": {
        prefix: "{",
        suffix: "}",
        type: matcherMarkupTypes.braces
    },
    "[": {
        prefix: "[",
        suffix: "]",
        type: matcherMarkupTypes.brackets
    },
    "<": {
        prefix: "<",
        suffix: ">",
        type: matcherMarkupTypes.chevrons
    },
};
const compareGroup = {
    split: "#",
    operatorRegex: /(<=?)|(>=?)|(==?)|(!=)/g,
    operatorTypes: {
        "<": "lt",
        "<=": "lte",
        ">": "gt",
        ">=": "gte",
        "=": "eq",
        "==": "eq",
        "!=": "ne"
    }
};

export const parseMatcherRules = (ruleText = "") => {
    let rules_AND = _.filter(ruleText.split("&&"));
    rules_AND = rules_AND.map(text => {
        let rules_OR = _.filter(text.split("||"));

        return rules_OR.map(ruleItem => {
            ruleItem = ruleItem.trim();
            let bracketPending, compareGroupPending;
            let firstCompareGroupMark = ruleItem.indexOf(compareGroup.split);

            if (firstCompareGroupMark === -1)
                bracketPending = ruleItem;
            else {
                bracketPending = ruleItem.substring(0, firstCompareGroupMark);
                compareGroupPending = ruleItem.substring(firstCompareGroupMark + 1);
            }

            let conditions = [];

            conditions = conditions.concat((() => {
                bracketPending = bracketPending.trim();

                let hasPlain;
                let groups = [];
                let buffer = "";
                let currentGroup;

                _.forEach(bracketPending, char => {
                    if (currentGroup && char === currentGroup.suffix) {
                        buffer = buffer.trim();
                        if (buffer)
                            groups.push({
                                type: currentGroup.type,
                                content: buffer
                            });
                        currentGroup = null;
                        buffer = "";
                        return;
                    }

                    if (!currentGroup && bracketGroup[char]) {
                        buffer = buffer.trim();
                        if (buffer && !hasPlain) {
                            groups.push({
                                type: matcherMarkupTypes.plain,
                                content: buffer
                            });
                            hasPlain = true;
                        }
                        currentGroup = bracketGroup[char];
                        buffer = "";
                        return;
                    }

                    buffer += char;
                });
                buffer = buffer.trim();
                if (buffer && !hasPlain && !currentGroup)
                    groups.push({
                        type: matcherMarkupTypes.plain,
                        content: buffer
                    });

                return groups;
            })());

            conditions = conditions.concat((() => {
                if (!compareGroupPending)
                    return [];

                let groups = compareGroupPending.split(compareGroup.split).map(compareGroupTextItem => {
                    compareGroupTextItem = compareGroupTextItem.trim();

                    let operator = _.first(compareGroupTextItem.match(compareGroup.operatorRegex));
                    let isNotEqualTag = compareGroupTextItem.startsWith("!") && !operator;
                    if (isNotEqualTag)
                        compareGroupTextItem = compareGroupTextItem.substring(1);
                    let temp = operator ? compareGroupTextItem.split(operator).map(str => str.trim()) : [compareGroupTextItem];

                    if (!temp[0])
                        return;

                    return {
                        type: matcherMarkupTypes.compare,
                        compare: {
                            operator: compareGroup.operatorTypes[operator ?? "=="],
                            attr: temp[0],
                            value: temp[1],
                            isNotEqualTag,
                        },
                    }
                });

                return _.filter(groups, "compare.attr");
            })());

            return conditions;
        });
    });

    return rules_AND;
};

export const matcher = (data, ruleConfig) => {
    if (!(ruleConfig?.rules ?? []).length)
        return data;

    let results_AND = _.map(ruleConfig.rules, rule_AND => {
        let results_OR = _.map(rule_AND, rule_OR => {
            let pool = data;
            let matched = _.findIndex(rule_OR, ruleItem => {
                let matchResult = ((ruleConfig.extractors ?? {})[ruleItem.type] ?? _.noop)(pool, ruleItem);
                if (matchResult && matchResult.length > 0)
                    pool = matchResult;
                return matchResult?.length === 0;//matchResult === undefined // ignored
            }) === -1;

            return matched ? pool : [];
        });

        return _.unionBy(...results_OR, "id");
    });

    return _.intersectionBy(...results_AND, "id");
};

