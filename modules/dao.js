import * as dotenv from 'dotenv';
import { google } from 'googleapis';
import log from './logger.js';
dotenv.config();
console.log = log;

const auth = new google.auth.GoogleAuth({
	keyFile: 'keys.json',
	scopes: 'https://www.googleapis.com/auth/spreadsheets',
});
const service = google.sheets({ version: 'v4', auth: auth });

class SheetDAO {
	spreadsheetId = process.env.spreadsheetId;
	sheetName = process.env.sheetName;

	clientExists = async (clients, partNum, partSize) => {
		let clientsCollection = [];
		for (let i = 0; i < clients.length; i++) {
			if (clients[i] !== null && clients[i].Entities.length !== 0) {
				clientsCollection.push('+');
			} else clientsCollection.push('-');
		}
		console.log('Info collected');
		await this.writeColumn('K', clientsCollection, partNum, partNum + partSize);
		console.log('Recorded...');
	};
	setId = async (clients, partNum, partSize, column) => {
		let clientsCollection = [];
		for (let i = 0; i < clients.length; i++) {
			if (clients[i]?.Count > 0 && clients[i]?.Entities[0] !== null) {
				clientsCollection.push(clients[i].Entities[0].Id);
			} else clientsCollection.push('-');
		}
		console.log('Info collected');
		await this.writeColumn(column, clientsCollection, partNum, partNum + partSize);
		console.log('Recorded...');
	};
	setRegistrationDate = async (clients, partNum, partSize, column) => {
		let clientsCollection = [];
		for (let i = 0; i < clients.length; i++) {
			console.log(clients[i]);
			if (clients[i] !== null) {
				clientsCollection.push(clients[i].CreationTime);
			} else clientsCollection.push('-');
		}
		console.log('Info collected');
		await this.writeColumn(column, clientsCollection, partNum, partNum + partSize);
		console.log('Recorded...');
	};
	setAllClientInfo = async (clients, partNum, partSize, columns) => {
		let clientsInfo = {
			fullname: [],
			phone: [],
			city: [],
			email: [],
		};
		for (let i = 0; i < clients.length; i++) {
			if (clients[i] === null) {
				clientsInfo.fullname.push('-');
				clientsInfo.phone.push('-');
				clientsInfo.city.push('-');
				clientsInfo.email.push('-');
			} else {
				clientsInfo.fullname.push(clients[i].LastName + ' ' + clients[i].FirstName + ' ' + clients[i].MiddleName);
				clientsInfo.phone.push(clients[i].MobileNumber);
				clientsInfo.email.push(clients[i].Email);
				clientsInfo.city.push(clients[i].CityName);
			}
		}
		console.log('Info collected');
		await this.writeColumn(columns.fullname, clientsInfo.fullname, partNum, partNum + partSize);
		await this.writeColumn(columns.phone, clientsInfo.phone, partNum, partNum + partSize);
		await this.writeColumn(columns.city, clientsInfo.city, partNum, partNum + partSize);
		await this.writeColumn(columns.email, clientsInfo.email, partNum, partNum + partSize);
		console.log('Recorded...');
	};
	setDepositAmount = async (clients, partNum, partSize, columns) => {
		let depositAmount = [];
		let depositExistance = [];
		for (let i = 0; i < clients.length; i++) {
			if (clients[i] === null) {
				depositAmount.push('');
				depositExistance.push('Нет');
			} else {
				let totalDeposit = 0;
				let entities = clients[i].PaymentRequests.Entities;
				if (entities.length > 0) {
					for (let j = 0; j < entities.length; j++) {
						if (entities[j].Status === 8) {
							totalDeposit += entities[j].Amount;
						}
					}
					console.log(`${entities[0].ClientId} has deposit ${totalDeposit}`);
					depositAmount.push(totalDeposit);
					depositExistance.push('Да');
				} else {
					depositAmount.push('');
					depositExistance.push('Нет');
				}
			}
		}
		console.log('Info collected');
		await this.writeColumn(columns.depositAmount, depositAmount, partNum, partNum + partSize);
		if (columns.depositExistance) {
			await this.writeColumn(columns.depositExistance, depositExistance, partNum, partNum + partSize);
		}
		console.log('Recorded...');
	};
	phoneAndMailExist = async (phones, mails, partNum, partSize, column) => {
		let ifExists = [];
		for (let i = 0; i < phones.length; i++) {
			if (phones[i] && mails[i] && mails[i] !== 'null' && phones[i] !== 'null') {
				ifExists.push('+');
			} else if (phones[i] && phones[i] !== 'null') {
				ifExists.push('phone');
			} else if (mails[i] && mails[i] !== 'null') {
				ifExists.push('mail');
			} else ifExists.push('-');
		}
		console.log('Info collected');
		await this.writeColumn(column, ifExists, partNum, partNum + partSize);
		console.log('Recorded...');
	};
	/// basic
	getColumn = async (column) => {
		console.log('get column');
		const getValues = await service.spreadsheets.values.get({
			auth,
			spreadsheetId: this.spreadsheetId,
			range: `${this.sheetName}!${column}:${column}`,
		});
		return [].concat.apply([], getValues.data.values);
	};
	writeCell = async (row, column, data) => {
		await service.spreadsheets.values.update({
			auth,
			spreadsheetId: this.spreadsheetId,
			range: `${sheetName}!${column}:${column}${row}`,
			valueInputOption: 'RAW',
			resource: {
				values: [[data]],
			},
		});
	};
	writeColumn = async (column, data, start, end) => {
		data = data.map((data) => {
			return [data];
		});
		await service.spreadsheets.values.update({
			auth,
			spreadsheetId: this.spreadsheetId,
			range: `${this.sheetName}!${column}${start}:${column}${end}`,
			valueInputOption: 'RAW',
			resource: {
				values: data,
			},
		});
	};
}

export default new SheetDAO();
