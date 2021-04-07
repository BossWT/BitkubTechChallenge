const axios = require('axios');

const result = {};
result['transactions'] = [];
result['balances'] = {};
const checkedWallet = [];

const get = async (url) => {
	try {
		const res = await axios.get(url);
		setTimeout(() => {}, 100);
		return res;
	} catch (e) {
		console.error(e);
	}
};

const tracking = async (address, result) => {
	const url = `https://api-ropsten.etherscan.io/api?module=account&action=tokentx&address=${address}&startblock=0&endblock=999999999&sort=asc&apikey=K7ST5DC6VP2Z5ZVWWD1IB3JDB5AHIEV274`;
	const response = await get(url);
	const data = response.data;
	const transactions = data.result;
	for (const t of transactions) {
		if (t.from === address && t.tokenSymbol === 'BKTC') {
			result['transactions'].push({
				tx: t.hash,
				from: t.from,
				to: t.to,
				amount: t.value / Math.pow(10, 18)
			});
			result['balances'][address] -= t.value / Math.pow(10, 18);
			if (!checkedWallet.includes(t.to)) {
				checkedWallet.push(t.to);
				result['balances'][t.to] = 0;
				await tracking(t.to, result);
			}
		} else if (t.to === address && t.tokenSymbol === 'BKTC') {
			result['balances'][address] += t.value / Math.pow(10, 18);
		}
	}
};

const main = async () => {
	let gobindAddress = '0xEcA19B1a87442b0c25801B809bf567A6ca87B1da';
	gobindAddress = gobindAddress.toLowerCase();
	result['balances'][gobindAddress] = 0;
	checkedWallet.push(gobindAddress);
	await tracking(gobindAddress, result);
	console.log(result);
	console.log(result['transactions'].length);
};

main();
