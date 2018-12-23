/*!
 * Copyright (C) 2018  Zachary Kohnen (DusterTheFirst)
 */

export interface IStringObject {
    [x: string]: string;
}

/**
 * parse GET params from url hash
 */
export function parseHash<T extends Record<string, string>>(w: Window = window): T {
    let query = w.location.hash.substr(1);
    let result: IStringObject = {};
    query.split("&").forEach((part) => {
        let item = part.split("=");
        result[item[0]] = decodeURIComponent(item[1]);
    });
    return result as T;
}