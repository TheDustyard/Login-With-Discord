namespace Util {
    export type stringObject = {
        [x: string]: string
    };

    /**
     * parse GET params from url
     */
    export function parseHash(w: Window = window): stringObject {
        var query = w.location.hash.substr(1);
        var result: stringObject = {};
        query.split("&").forEach((part) => {
            var item = part.split("=");
            result[item[0]] = decodeURIComponent(item[1]);
        });
        return result;
    }

    export type Method = "GET" | "POST" | "PUT";

    export function request(method: Method, url: string, headers: stringObject = {}): Promise<string> {
        return new Promise((resolve, reject) => {
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = () => {
                if (xmlHttp.readyState == 4)
                    if (xmlHttp.status == 200)
                        resolve(xmlHttp.responseText);
                    else
                        reject(`${xmlHttp.status}: ${xmlHttp.statusText}`);
            };
            xmlHttp.open(method, url, true);
            for (let header in headers) {
                xmlHttp.setRequestHeader(header, headers[header]);
            }
            xmlHttp.send();
        });
    }

    export function requestJSON<T>(method: Method, url: string, headers?: stringObject): Promise<T> {
        return new Promise((resolve, reject) => {
            request(method, url, headers).then((data) => {
                resolve(JSON.parse(data));
            }).catch(reject);
        });
    }
}