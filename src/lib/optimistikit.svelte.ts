import { applyAction, enhance as default_enhance } from '$app/forms';
import { invalidateAll } from '$app/navigation';
import { getContext, setContext } from 'svelte';
import { SvelteSet } from 'svelte/reactivity';

type OptimistikitOptions = {
	key: string;
	enhance: typeof default_enhance;
};

export function optimistikit<T>(
	og_data: () => T,
	{ key = 'default', enhance = default_enhance } = {} as OptimistikitOptions,
) {
	const data = $state($state.snapshot(og_data()) as T);
	const updates = new SvelteSet<{ optimistic_update: (data: T) => void; data?: T }>();

	$effect.pre(() => {
		let final_data = $state.snapshot(og_data()) as T;
		updates.forEach((update) => {
			if (update.data) {
				final_data = update.data;
			} else {
				update.optimistic_update(final_data);
				update.data = $state.snapshot(final_data) as T;
			}
		});
		for (const key in final_data) {
			data[key] = final_data[key];
		}
	});
	const abort_controllers = new WeakMap<HTMLFormElement, AbortController>();
	const updates_fns = new WeakMap<
		HTMLFormElement,
		typeof updates | Map<string, typeof updates>
	>();
	function optimistic_action(
		node: HTMLFormElement,
		optimistic_fn: (
			data: T,
			...rest: Parameters<NonNullable<Parameters<typeof enhance>[1]>>
		) => void,
	) {
		let fn = optimistic_fn;
		const ret = enhance(node, (props) => {
			const key = node.dataset.key;
			if (key) {
				abort_controllers.get(props.formElement)?.abort();
			}
			abort_controllers.set(props.formElement, props.controller);
			const update_fn = { optimistic_update: (data: T) => fn(data, props) };
			if (!updates_fns.has(props.formElement)) {
				updates_fns.set(
					props.formElement,
					key != null ? new Map([[key, new SvelteSet()]]) : new SvelteSet(),
				);
			}
			const set_or_map = updates_fns.get(props.formElement)!;
			if (set_or_map instanceof Map) {
				set_or_map.get(key!)!.add(update_fn);
			} else {
				set_or_map.add(update_fn);
			}
			updates.add(update_fn);
			return async ({ action, result }) => {
				if (key) {
					const set_or_map = updates_fns.get(props.formElement)!;
					if (set_or_map instanceof Map) {
						for (const update_fn of set_or_map.get(key)!.values?.() ?? []) {
							updates.delete(update_fn);
						}
					}
				} else {
					updates.delete(update_fn);
				}
				await invalidateAll();
				if (
					location.origin + location.pathname === action.origin + action.pathname ||
					result.type === 'redirect' ||
					result.type === 'error'
				) {
					applyAction(result);
				}
			};
		});
		return {
			update(new_fn: typeof optimistic_fn) {
				fn = new_fn;
			},
			destroy: ret.destroy,
		};
	}
	setContext(key, {
		optimistic_action,
	});
	return {
		get data() {
			return data;
		},
		enhance: optimistic_action,
	};
}

export function get_action<T>(key = 'default') {
	return (
		getContext<{
			optimistic_action: (
				node: HTMLFormElement,
				update: (data: T, formData: FormData) => void,
			) => ReturnType<typeof default_enhance>;
		}>(key)?.optimistic_action ?? (() => {})
	);
}
