const {parse} = require("url");

const convertFieldsToProperties = obj => {
  const shallowCopy = {...obj};
  
  Object.keys(obj).forEach(key => Object.defineProperty(obj, key, {
    get: () => shallowCopy[key],
    set: v => shallowCopy[key] = v,
  }));
  return obj;
};


//Hack to bypass micro-proxy's lints and implement pseudo path+host rewrite
const withCustomResolver = (resolve) => {
  const baseUrl = parse("http://some.host.to.fool.you");
  convertFieldsToProperties(baseUrl);
  
  baseUrl.toString = baseUrl.format;
  baseUrl.resolve = path => resolve({baseUrl, path});
  return baseUrl;
};

const forwardUrlParams = targetUrlExtractor => ({baseUrl = {}, path}) => {
  const targetUrl = targetUrlExtractor(path);
  Object.assign(baseUrl, targetUrl);
  return targetUrl;
};

const extractFromPath = pathPattern => path => parse(decodeURIComponent(pathPattern.exec(path)[1]));


module.exports = {
  rules: [
    {
      pathname: "/proxy",
      dest: withCustomResolver(forwardUrlParams(extractFromPath(/proxy\/(.*)/)))
    },
  ]
};
