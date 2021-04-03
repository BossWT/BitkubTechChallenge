const axios = require('axios');

const get = async (url) => {
	try {
		const res = await axios.get(url);
		setTimeout(() => {}, 500);
		return res;
	} catch (e) {
		console.error(e);
	}
};

const url =
	'https://api-ropsten.etherscan.io/api?module=account&action=tokentx&address=0xEcA19B1a87442b0c25801B809bf567A6ca87B1da&startblock=0&endblock=999999999&sort=asc&apikey=K7ST5DC6VP2Z5ZVWWD1IB3JDB5AHIEV274';

let gobindAddress = '0xEcA19B1a87442b0c25801B809bf567A6ca87B1da';
gobindAddress = gobindAddress.toLowerCase();

const tracking = async (address, result) => {
	const url = `https://api-ropsten.etherscan.io/api?module=account&action=tokentx&address=${address}&startblock=0&endblock=999999999&sort=asc&apikey=K7ST5DC6VP2Z5ZVWWD1IB3JDB5AHIEV274`;
	const response = await get(url);
	const data = response.data;
	const transactions = data.result;
	const filtered = [];
	for (const t of transactions) {
		if (t.from === address && t.tokenSymbol === 'BKTC') filtered.push(t);
		if (t.to === address && t.tokenSymbol === 'BKTC')
			result['balances'][address] += t.value / Math.pow(10, 18);
	}
	const newWallet = [];
	filtered.forEach((t) => {
		result['transactions'].push({
			Tx: t.hash,
			from: t.from,
			to: t.to,
			Amount: t.value / Math.pow(10, 18)
		});
		const walletAddress = t.to;
		newWallet.push(walletAddress);
		if (!result['balances'][walletAddress]) {
			result['balances'][address] -= t.value / Math.pow(10, 18);
			result['balances'][walletAddress] = t.value / Math.pow(10, 18);
		} else {
			result['balances'][address] -= t.value / Math.pow(10, 18);
			result['balances'][walletAddress] += t.value / Math.pow(10, 18);
		}
	});
	console.log(newWallet);
	for (const t of newWallet) await tracking(t, result);
};

const main = async () => {
	const response = await get(url);
	const data = response.data;
	const transactions = data.result;
	const result = {};

	result['transactions'] = [];
	result['balances'] = {};
	const filtered = [];
	result['balances'][gobindAddress] = 0;
	for (const t of transactions) {
		if (t.from === gobindAddress && t.tokenSymbol === 'BKTC')
			filtered.push(t);
		if (t.to === gobindAddress && t.tokenSymbol === 'BKTC')
			result['balances'][gobindAddress] += t.value / Math.pow(10, 18);
	}
	filtered.forEach((t) => {
		result['transactions'].push({
			Tx: t.hash,
			from: t.from,
			to: t.to,
			Amount: t.value / Math.pow(10, 18)
		});
		const walletAddress = t.to;
		if (!result['balances'][walletAddress]) {
			result['balances'][walletAddress] = t.value / Math.pow(10, 18);
		} else {
			result['balances'][walletAddress] += t.value / Math.pow(10, 18);
		}
	});
	for (const t of result['transactions']) {
		const toAddress = t.to;
		await tracking(toAddress, result);
	}
	console.log(result);
};

main();
