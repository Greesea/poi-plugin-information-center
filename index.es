import path from "path";
import React, {useState, useEffect} from "react";
import {connect} from "react-redux";
import {createSelector} from "reselect";
import "./views/lib/debug/index";

import Entry from "./views/index";
import {infoSelector} from "./redux/selectors.es";
import {wctfSelector} from "views/utils/selectors";
import {network, resourceType} from "./views/utils.es";
import {EXTENSION_KEY, RES} from "./views/constants.es";

const serverIpSelector = createSelector([infoSelector], info => info?.server?.ip);
const selector = createSelector(
    [serverIpSelector, wctfSelector],
    (serverIp, wctf) => ({
        initData: {
            serverIp,
            wctf
        },
    })
);
const mapStateToProps = state => selector(state);
const mapDispatchToProps = dispatch => ({
    init: async initData => {
        dispatch({type: `@@${EXTENSION_KEY}@__begin__`,});

        try {
            network.setInitData({
                serverIp: initData.serverIp,
            });

            dispatch({
                type: `@@${EXTENSION_KEY}@__update__`,
                data: {
                    resource: {
                        icons: {
                            useItems: await network.getStaticResource(RES.IMAGE_COMMON_ITEMICONS, resourceType.IMAGE),
                        },
                        others: {
                            port_skin_1_22: path.join(__dirname, "assets/images/port_skin_1_22.webp"),
                        },
                    },
                },
                init: {
                    wctf: initData.wctf,
                },
            });
        } catch (e) {
            dispatch({type: `@@${EXTENSION_KEY}@__fail__`,});
        } finally {
            dispatch({type: `@@${EXTENSION_KEY}@__finally__`,});
        }
    },
});

export const reactClass = connect(mapStateToProps, mapDispatchToProps)(function (props) {
    const [initTrigger] = useState(0);
    useEffect(() => {
        console.log("[track] core update");
        props?.init(props.initData);
    }, [initTrigger]);

    return (
        <Entry/>
    )
});
export {default as reducer} from "./redux/reducer";
