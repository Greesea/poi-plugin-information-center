import * as path from "path";

export const resourceType = {
    RAW: 1,
    TEXT: 2,
    JSON: 3,
    IMAGE: 4,
    SOUND: 5,
};

export const network = {
    protocol: "http",
    serverIp: "",
    setInitData: initData => {
        network.protocol = initData.protocol ?? network.protocol;
        network.serverIp = initData.serverIp ?? network.serverIp;
    },

    getContent: (url, resType) => {
        if (url.startsWith("/"))
            url = `${network.protocol}://${network.serverIp}${url}`;

        let request = fetch(url, {method: "GET"});
        if (resType === resourceType.RAW)
            return request;

        return request.then(response => {
            switch (resType) {
                case resourceType.TEXT:
                    return response.text();
                case resourceType.JSON:
                    return response.json();
                case resourceType.IMAGE:
                case resourceType.SOUND:
                    return response.blob();
            }
        });
    },

    getStaticResource: (url, resType = resourceType.IMAGE, configUrl = null) => {
        return Promise.all([
            network.getContent(url, resType),
            network.getContent(configUrl ?? url.substring(0, url.lastIndexOf(".")) + ".json", resourceType.JSON),
        ]).then(data => {
            switch (resType) {
                case resourceType.IMAGE:
                    return resource.unpackTexture(data[0], data[1]);
                case resourceType.SOUND:
                    return Promise.resolve(data);//FIXME NOTHING
            }
        });
    },
};

export const resource = {
    unpackTexture: (blob, configJSON) => {
        if (!configJSON)
            return Promise.reject();

        return new Promise((resolve, reject) => {
            let canvas = document.createElement("canvas");
            let cxt = canvas.getContext("2d");

            let texture = new Image();
            let textureBlobURL = URL.createObjectURL(blob);
            texture.onload = () => {
                resolve(_.reduce(configJSON.frames, (storage, item, key) => {
                    let info = item?.frame;
                    if (!info)
                        return storage;

                    canvas.width = info.w;
                    canvas.height = info.h;

                    cxt.clearRect(0, 0, canvas.width, canvas.height);
                    cxt.drawImage(texture, info.x, info.y, info.w, info.h, 0, 0, info.w, info.h);

                    storage[key] = canvas.toDataURL("image/webp");
                    return storage;
                }, {}));

                URL.revokeObjectURL(textureBlobURL);
            };
            texture.onerror = () => {
                reject();

                URL.revokeObjectURL(textureBlobURL);
            };
            texture.src = textureBlobURL;
        })
    },
};

let __extractProperties = (obj, newObj, props) => {
    props?.forEach(propName => newObj[propName] = obj[propName]);
    return newObj;
};
export const extractProperties = (obj, props) => {
    let result = {};
    return __extractProperties(obj, result, props);
};
extractProperties.clear = (obj, props) => {
    let result = Object.create(null);
    return __extractProperties(obj, result, props);
};

let __compareFn = {
    "lt": (left, right) => left < right,
    "lte": (left, right) => left <= right,
    "gt": (left, right) => left > right,
    "gte": (left, right) => left >= right,
    "eq": (left, right) => left === right,
    "ne": (left, right) => left !== right,
};
export const compare = (left, right, operator, invertResult = false) => {
    let result = __compareFn[operator] ? __compareFn[operator](left, right) : false;
    return invertResult ? !result : result;
};

export const POI_ROOT = pathString => path.resolve(ROOT, pathString);
