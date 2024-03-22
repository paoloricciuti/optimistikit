import { values } from './values';

function wait(ms: number) {
	return new Promise((r) => {
		setTimeout(r, ms);
	});
}

export function load() {
	return values;
}

export const actions = {
	async list() {
		await wait(2000);
		values.list.push(values.list.length);
	},
	async count() {
		await wait(2000);
		values.count++;
	},
};
