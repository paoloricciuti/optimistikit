import { values } from '../values';

export function POST() {
	values.count = 0;
	values.list = [];
	return new Response(null, {
		status: 201,
	});
}
