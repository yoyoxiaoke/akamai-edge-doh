import { httpRequest } from "http-request";
import { createResponse } from "create-response";

export async function getJSON (url) {
	let ret = JSON.parse('{ "code": 1, "data": "", "err": "" }');
	const response = await httpRequest(`${url}`);
	if (response.ok) {
		ret = await response.json();
	} else {
		ret.code = 2;
		ret.err = `Failed to return ${url}`;
	}
	return ret;
}

export function responseErr(request, error) {
	request.respondWith(
		200,
		{ 'Content-Type': ['application/json;charset=utf-8'] },
		JSON.stringify({ code: 0, error, request })
	  );
	return;
}

export function responseOk(request, data) {
	request.respondWith(
		200,
		{ 'Content-Type': ['application/json;charset=utf-8'] },
		JSON.stringify({ code: 1, data })
	  );
	return;
}

export function createResponseErr(error) {
	return createResponse(
		200,
		{ 'Content-Type': ['application/json;charset=utf-8'] },
		JSON.stringify({ code: 0, error })
	  );
}

export function createResponseOk(data) {
	return createResponse(
		200,
		{ 'Content-Type': ['application/json;charset=utf-8'] },
		JSON.stringify({ code: 1, data })
	  );
}

function urlEncode(param, key, encode) {
	if(param==null) return '';
	var paramStr = '';
	var t = typeof (param);
	if (t == 'string' || t == 'number' || t == 'boolean') {
	  paramStr += '&' + key + '=' + ((encode==null||encode) ? encodeURIComponent(param) : param);
	} else {
	  for (var i in param) {
		var k = key == null ? i : key + (param instanceof Array ? '[' + i + ']' : '.' + i);
		paramStr += urlEncode(param[i], k, encode);
	  }
	}
	return paramStr;
}

export function urlStringify(param) {
	const query = urlEncode(param); 
	return query ? query.substr(1) : "";
}