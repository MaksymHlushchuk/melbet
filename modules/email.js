import { fetch } from 'cross-fetch';
import { getToken } from './getToken.js';
const genRequestObject = async (email, partnerId) => {
	return {
		SkipCount: 0,
		TakeCount: 1,
		OrderBy: null,
		FieldNameToOrderBy: '',
		PartnerId: partnerId,
		Ids: [],
		Emails: [{ OperationTypeId: 8, StringValue: email }],
		UserNames: [],
		UniqueIds: [],
		FirstNames: [],
		LastNames: [],
		MobileNumbers: [],
		PhoneNumbers: [],
		CurrencyIds: [],
		DocumentNumbers: [],
		RegistrationIps: [],
		SportClinetIds: [],
		ShebaNumbers: [],
		SocialCardNumbers: [],
		FromList: false,
		IsQuickSearch: true,
	};
};

const genParams = async (requestObject, token) => {
	const details = {
		Method: 'GetClientsShort',
		Controller: 'Client',
		TimeZone: '2',
		RequestObject: JSON.stringify(requestObject),
	};
	let payload = [];
	for (let property in details) {
		let encodedKey = encodeURIComponent(property);
		let encodedValue = encodeURIComponent(details[property]);
		payload.push(encodedKey + '=' + encodedValue);
	}
	payload = payload.join('&');

	return {
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
			Authorization: token,
		},
		body: payload,
		method: 'POST',
	};
};

export const getClientByEmail = async (email) => {
	let reqObj = await genRequestObject(email, process.env.partnerId);
	let data;
	try {
		do {
			let response = await fetch(process.env.url_dep, await genParams(reqObj, await getToken())).catch((err) => {
				console.log(`ERR:${err}`);
			});
			data = JSON.parse(JSON.stringify(await response.json()));
			if (data.ResponseCode === 29 || data.ResponseCode === 68) {
				console.log('ResponseCode: ' + data.ResponseCode);
			} else if (data.ResponseCode === 22) {
				console.log('ResponseCode: ' + data.ResponseCode);
				return null;
			}
		} while (data.ResponseCode !== 0);
	} catch (ex) {
		console.log(ex);
		return null;
	}
	// console.log(data);
	return data.ResponseObject;
};

export default { getClientByEmail };