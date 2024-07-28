# optimistikit

Optimistic UI is not easy...but it can be easier then ever in SvelteKit with Optimistikit!

> **Warning**
>
> This package is meant to be used with Svelte-Kit as the name suggest. Because it uses api that are **only** present in Svelte-Kit it will not work in your normal svelte project.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

![npm](https://img.shields.io/npm/v/optimistikit)

![npm](https://img.shields.io/npm/dt/optimistikit)

![GitHub last commit](https://img.shields.io/github/last-commit/paoloricciuti/optimistikit)

## Contributing

Contributions are always welcome!

For the moment there's no code of conduct neither a contributing guideline but if you found a problem or have an idea feel free to [open an issue](https://github.com/paoloricciuti/optimistikit/issues/new)

If you want the fastest way to open a PR try out Codeflow

[![Open in Codeflow](https://developer.stackblitz.com/img/open_in_codeflow.svg)](https://pr.new/paoloricciuti/optimistikit/)

## Authors

-   [@paoloricciuti](https://www.github.com/paoloricciuti)

## Installation

Install optimistikit with npm

```bash
  npm install optimistikit@latest
```

## Usage/Examples

The concept behind optimistikit is quite straightforward. Instead of using the `data` props from SvelteKit you can call the function `optimistikit` and get back a function to call whenever data changes and an action to apply to all of your forms.

### Basic example

Imagine you have this `+page.server.ts`

```ts
export async function load() {
	const comments = await db.select(comments);
	return {
		comments,
	};
}

export const actions = {
	async add({ request }) {
		const formData = await request.formData();
		const new_comment = formData.get('comment');
		if (new_comment) {
			await db.insert(comments).values({
				content: new_comment,
			});
		}
	},
};
```

and this `+page.svelte`

```svelte
<script lang="ts">
	const { data } = $props();
</script>

<form method="post" action="?/add">
	<input name="comment" />
	<button>Add comment</button>
</form>
<ul>
	{#each data.comments as comment}
		<li>{comment.content}</li>
	{/each}
</ul>
```

if you want to optimistically add the comment using `optimistikit` you would need the following updated to `+page.svelte`

```svelte
<script lang="ts">
	import { optimistikit } from 'optimistikit';
	const { data } = $props();
	const { enhance, data: optimistic_data } = optimistikit(() => data);
</script>

<form
	use:enhance={(data, { formData }) => {
		const new_comment = formData.get('comment');
		if (new_comment) {
			// just mutate `data`
			data.comments.push({
				content: new_comment,
			});
		}
	}}
	method="post"
	action="?/add"
>
	<input name="comment" />
	<button>Add comment</button>
</form>
<ul>
	<!-- use `optimistic_data` instead of `data` -->
	{#each optimistic_data.comments as comment}
		<li>{comment.content}</li>
	{/each}
</ul>
```

### Keyed forms

Sometimes the resource that you are updating on the server is always the same resource (eg. updating a comment). When that's the case we want to cancel every concurrent request. You can do this by adding an unique `data-key` attribute to the form.

```ts
export async function load() {
	const comments = await db.select(comments);
	return {
		comments,
	};
}

export const actions = {
	// other actions
	async edit({ request }) {
		const formData = await request.formData();
		const new_comment = formData.get('comment');
		const id = formData.get('id');
		if (new_comment && id) {
			await db
				.update(comments)
				.values({
					content: new_comment,
				})
				.where({
					id,
				});
		}
	},
};
```

and this is the `+page.svelte`

```svelte
<script lang="ts">
	import { optimistikit } from 'optimistikit';
	const { data } = $props();

	const { enhance, data: optimistic_data } = optimistikit(() => data);
</script>

<!-- rest of the page -->
<ul>
	<!-- use `optimistic_data` instead of `data` -->
	{#each optimistic_data.comments as comment}
		<li>
			<form
				method="post"
				action="?/edit"
				data-key="edit-comment-{comment.id}"
				use:enhance={(data, { formData }) => {
					const new_comment = formData.get('comment');
					const id = formData.get('id');
					if (new_comment && id) {
						const comment = data.comments.find((comment) => comment.id === id);
						// just mutate `data`
						comment.content = new_comment;
					}
				}}
			>
				<input name="id" type="hidden" value={comment.id} />
				<input name="comment" value={comment.content} />
				<button>Edit</button>
			</form>
		</li>
	{/each}
</ul>
```

### Use in nested components

If you have a form in a nested component it can be tedious to pass either `data` or the `enhance` action around. To solver this problem there's another export from `optimistikit` that allows you to grab the action directly

```svelte
<script lang="ts">
	import { get_action } from 'optimistikit';
	import type { PageData } from './$types';

	const enhance = get_action<PageData>();
</script>

<form
	use:enhance={(data) => {
		// your logic
	}}
>
	<!-- your form -->
</form>
```

### Options

The function `optimistikit` can optionally receive an object as argument where you can specify two values:

-   `key`: a string that allows you to have different actions/stores in the same route. Most of the times you will probably not need this since specifying a key also means that the updates from the forms will involve only the state returned from that specific `optimistikit` function.
-   `enhance`: some libraries like [superforms](https://superforms.rocks) provide a custom `enhance` function that is different from the one provided by SvelteKit. To allow you to use this libraries together with `optimistikit` you can pass a custom `enhance` function. It's important for this function to have the same signature as the sveltekit one.

## What about svelte 4?

If you are using `svelte@4` you really should upgrade to `svelte@5`...but if you can't you can use the legacy tag of this library that uses a store and has a slightly different and less ergonomic API.

You can install it like this:

```bash
npm i optimistikit@legacy
```

Check the documentation [here!](https://github.com/paoloricciuti/optimistikit/tree/legacy#)
