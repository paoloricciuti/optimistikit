<script lang="ts">
	import Component from './Component.svelte';
	import { optimistikit } from 'optimistikit';

	export let data;

	const { enhance, optimistic } = optimistikit<typeof data>();

	$: optimistic_data = optimistic(data);

	$: optimistic_list = [...$optimistic_data.list].sort((a, b) => a - b);
	$: list = [...data.list].sort((a, b) => a - b);
</script>

<form
	action="?/list"
	method="post"
	use:enhance={(data) => {
		data.list.push(data.list.length);
	}}
>
	<button data-testid="add-button">Add to list</button>
</form>

<form
	method="post"
	data-key="count"
	action="?/count"
	use:enhance={(data) => {
		data.count++;
	}}
>
	<button data-testid="up-count">{data.count}</button>
</form>

<Component count={$optimistic_data.count} />

<ul data-testid="optimistic-list">
	{#each optimistic_list as list_elem}
		<li>{list_elem}</li>
	{/each}
</ul>

<ul data-testid="list">
	{#each list as list_elem}
		<li>{list_elem}</li>
	{/each}
</ul>

<p data-testid="optimistic-count">
	{$optimistic_data.count}
</p>

<p data-testid="count">
	{data.count}
</p>
