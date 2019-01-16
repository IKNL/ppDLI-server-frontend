import { config } from './config';

function getBaseURL(with_api_path=true) {
    console.log('config: ', config);

    var base = config.protocol + config.host;

    if (config.port) {
        base = base + ':' + config.port.toString();
    }

    if (with_api_path) {
        return base + config.api_path;
    }

    return base   
}

function getFullUrlForPath(path) {
    let with_api_path = !path.startsWith(config.api_path);
    return getBaseURL(with_api_path) + path
}

export {
    config, 
    getBaseURL,
    getFullUrlForPath,
}

