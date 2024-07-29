import { expect } from '@playwright/test';
import { test } from './extends.js';

test.describe('non keyed forms', () => {
	test("optimistic data update immediately and actual data updates after the invalidation happens and it's has the same value", async ({
		page,
	}) => {
		await page.goto('/');
		const add_to_list_button = page.getByTestId('add-button');
		await add_to_list_button.click();
		let optimistic_list = page.getByTestId('optimistic-list');
		let list = page.getByTestId('list');
		expect(optimistic_list.locator('li')).toHaveCount(1);
		expect(list.locator('li')).toHaveCount(0);
		await page.waitForRequest((req) => {
			const url = new URL(req.url());
			return url.pathname === '/__data.json';
		});
		optimistic_list = page.getByTestId('optimistic-list');
		list = page.getByTestId('list');
		expect(optimistic_list.locator('li')).toHaveCount(1);
		expect(list.locator('li')).toHaveCount(1);
	});

	test("optimistic data update immediately and actual data updates after the invalidation happens and it's has the same value (form in component)", async ({
		page,
	}) => {
		await page.goto('/');
		const add_to_list_button = page.getByTestId('add-button-component');
		await add_to_list_button.click();
		let optimistic_list = page.getByTestId('optimistic-list');
		let list = page.getByTestId('list');
		expect(optimistic_list.locator('li')).toHaveCount(1);
		expect(list.locator('li')).toHaveCount(0);
		await page.waitForRequest((req) => {
			const url = new URL(req.url());
			return url.pathname === '/__data.json';
		});
		optimistic_list = page.getByTestId('optimistic-list');
		list = page.getByTestId('list');
		expect(optimistic_list.locator('li')).toHaveCount(1);
		expect(list.locator('li')).toHaveCount(1);
	});
});

test.describe('keyed forms', () => {
	test("optimistic data update immediately and actual data updates after the invalidation happens and it's has the same value (form in component, old requests from the same form are cancelled)", async ({
		page,
	}) => {
		await page.goto('/');
		const up_count_button = page.getByTestId('up-count-component');
		let cancelled_req = 0;
		page.on('request', async (req) => {
			if (req.method() === 'POST') {
				const res = await req.response();
				if (res === null) {
					cancelled_req += 1;
				}
			}
		});
		await up_count_button.click();
		const optimistic_count = page.getByTestId('optimistic-count');
		const count = page.getByTestId('count');
		await expect(optimistic_count).toHaveText('1');
		await expect(count).toHaveText('0');
		await up_count_button.click();
		await expect(optimistic_count).toHaveText('2');
		await expect(count).toHaveText('0');
		expect(cancelled_req).toBe(1);
		await page.waitForRequest((req) => {
			const url = new URL(req.url());
			return url.pathname === '/__data.json';
		});
		await expect(optimistic_count).toHaveText('2');
		await expect(count).toHaveText('2');
	});

	test("optimistic data update immediately and actual data updates after the invalidation happens and it's has the same value (old requests from the same form are cancelled)", async ({
		page,
	}) => {
		await page.goto('/');
		const up_count_button = page.getByTestId('up-count');
		let cancelled_req = 0;
		page.on('request', async (req) => {
			if (req.method() === 'POST') {
				const res = await req.response();
				if (res === null) {
					cancelled_req += 1;
				}
			}
		});
		await up_count_button.click();
		const optimistic_count = page.getByTestId('optimistic-count');
		const count = page.getByTestId('count');
		await expect(optimistic_count).toHaveText('1');
		await expect(count).toHaveText('0');
		await up_count_button.click();
		await expect(optimistic_count).toHaveText('2');
		await expect(count).toHaveText('0');
		expect(cancelled_req).toBe(1);
		await page.waitForRequest((req) => {
			const url = new URL(req.url());
			return url.pathname === '/__data.json';
		});
		await expect(optimistic_count).toHaveText('2');
		await expect(count).toHaveText('2');
	});
});
