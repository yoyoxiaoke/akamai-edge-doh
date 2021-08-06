import URLSearchParams from "url-search-params";  
import { EdgeKV } from './edgekv.js';
import { ICache} from './utils/icache.js';
import { responseErr, responseOk, getJSON, urlStringify, createResponseErr, createResponseOk } from './utils/lib.js'

const edgeKv = new EdgeKV({namespace: "ewcc", group: "group3"});

export async function onClientRequest(request) {
	const urlParams = new URLSearchParams(request.query)
    const domain = urlParams.get("domain")
	if (!domain) {
		responseErr(request, 'Domain Must Be Provided');
		return;
	}

	const icache = new ICache(request, domain);
	try {
        const value = await edgeKv.getJson({ item: icache.key });
		icache.updateTtl(value);
		const newCache = icache.value;
		if (newCache) {
			responseOk(request, newCache);
			return;
		}
    } catch (error) {
		responseErr(request, error.toString());
		return;
    }
}

export async function responseProvider(request) {
	const now = Date.parse(new Date()) / 1000;
	const icache = new ICache(request, (new URLSearchParams(request.query)).get("domain"));
	const url = `${request.scheme}://${request.host}${request.path}?${urlStringify(icache.params)}`;
	const ret = await getJSON(url);
	switch (ret.code) {
		case 0: 
			return createResponseErr(ret.err);
		case 1:
			try {
				edgeKv.putJson({ item: icache.key, value: { timestamp: now, dns: ret.data } });
			} catch (error) {
				return createResponseErr(error.toString());
			}
			return createResponseOk(ret.data);
		case 2:
			const value = await edgeKv.getJson({ item: icache.key });
			if (value) {
				const { dns } = value;
				try {
					edgeKv.putJson({ item: icache.key, value: { dns, timestamp: now } });
					return createResponseOk(dns);
				} catch (error) {
					return createResponseErr(error.toString());
				}
			}
			return createResponseErr("Request Doh Server Failed And Kv Is Empty");
		default:
			return createResponseErr("Bad Code Number");
	}
}