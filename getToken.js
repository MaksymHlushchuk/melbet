//const { Builder, By, Key, until, error, logging } = require('selenium-webdriver');
// const { elementLocated } = require('selenium-webdriver/lib/until');
// const readline = require('readline-sync');
// const firefox = require('selenium-webdriver/firefox');
const link = 'https://admin.dgbuilder.ru/#/platform/welcome';

import readline from 'readline-sync';
import { Builder, By, error, Key, logging, until } from 'selenium-webdriver';
import firefox from 'selenium-webdriver/firefox.js';
import { elementLocated } from 'selenium-webdriver/lib/until.js';
let driver;
let accessToken;

const login = async (google2fa) => {
	await driver.get(link);
	await driver.wait(until.elementLocated(By.className('mat-form-field-infix')));
	await driver.findElement(By.id('mat-input-0')).sendKeys('Maksym.Hlushchuk');
	await driver.findElement(By.id('mat-input-1')).sendKeys('Melbet1488');
	await driver.findElement(By.className('mat-button-wrapper')).click();
	await driver.wait(until.elementLocated(By.id('mat-input-2')));
	//let google2fa = askGoogleCode('Input google 2FA code: ');
	await driver.findElement(By.id('mat-input-2')).sendKeys(google2fa);
	await driver.findElement(By.className('mat-button-wrapper')).click();
	console.log('login');
};
const getDriver = () => {
	return driver;
};
const main = async () => {
	driver = await new Builder()
		.forBrowser('firefox')
		.setFirefoxOptions(new firefox.Options().headless().windowSize({ width: 1600, height: 900 }))
		.build();
	//await driver.get(`https://www.google.com/search?&q=google`);
	//await driver.findElement(By.xpath('/html/body/div[3]/div[3]/span/div/div/div/div[3]/div[1]/button[1]/div')).click();
};

const getToken = async () => {
	let authDirty;
	authDirty = await driver.executeScript(function () {
		return localStorage.getItem('authData');
	});
	accessToken = authDirty.split('"')[3];
	accessToken = 'Bearer ' + accessToken;
	console.log('New token: ' + accessToken.substring(0, 15));
	return accessToken;
};

const askGoogleCode = (question) => {
	return readline.question(question);
};

const initialize = async (google2fa) => {
	await main().then((data) => login(google2fa));
};
export default { getToken, initialize, getDriver };
//module.exports = { getToken, initialize, getDriver };