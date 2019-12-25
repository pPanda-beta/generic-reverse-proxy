const wrapLibFunction = (moduleName, funcName, proxyfier) => {
	const lib = require(moduleName);
	const oldFunc = lib[funcName];
	lib[funcName] = (...args) => proxyfier(oldFunc, ...args);
};


const addReqInterceptor = (interceptAndModify) => {
	interceptedRequestFunc = (oldFunc, ...args) => {
		interceptAndModify(...args);
		return oldFunc(...args);
	};
	wrapLibFunction("http", "request", interceptedRequestFunc);
	wrapLibFunction("https", "request", interceptedRequestFunc);
};

const setDefaultHeaders = (defaultHeaders) => (options) => Object.entries(defaultHeaders)
	.forEach(([name, defaultValue]) => {
		options.headers[name] = options.headers[name] || defaultValue;
	});


addReqInterceptor(setDefaultHeaders({
	"accept-encoding": ["gzip, deflate, br"],
	"user-agent": ["Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"],
	"accept": ["*/*"],
	"accept-language": ["en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7"],
	"connection": ["keep-alive"],
}));


require("./node_modules/.bin/micro-proxy");
