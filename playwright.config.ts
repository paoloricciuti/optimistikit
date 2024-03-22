import type { PlaywrightTestConfig } from '@playwright/test';

const playground = process.env.FIVE === 'true' ? 'playground5' : 'playground';
const no_build = process.env.NOBUILD === 'true';

const config: PlaywrightTestConfig = {
	webServer: {
		command: `${!no_build ? 'pnpm run build && ' : ''}pnpm run build:${playground} && pnpm run preview:${playground}`,
		port: 4173,
		stderr: 'pipe',
		stdout: 'pipe',
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
};

export default config;
