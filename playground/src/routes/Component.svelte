<script lang="ts">
	import { getAction } from 'optimistikit';
	import type { PageData } from './$types';

	export let count: number;

	const enhance = getAction<PageData>();
</script>

<form
	action="?/list"
	method="post"
	use:enhance={(data) => {
		data.list.push(data.list.length);
	}}
>
	<button data-testid="add-button-component">Add to list</button>
</form>

<form
	method="post"
	data-key="count"
	action="?/count"
	use:enhance={(data) => {
		data.count++;
	}}
>
	<button data-testid="up-count-component">{count}</button>
</form>
