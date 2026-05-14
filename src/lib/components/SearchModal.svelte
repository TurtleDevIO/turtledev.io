<script lang="ts">
	import { goto } from '$app/navigation';
	import { loadSearchIndex } from '$lib/utils/search';
	import { formatDate } from '$lib/utils/date';
	import type { Post } from '$lib/types';
	import type Fuse from 'fuse.js';

	let { open = $bindable(false) }: { open: boolean } = $props();

	let query = $state('');
	let fuse = $state<Fuse<Post> | null>(null);
	let allPosts = $state<Post[]>([]);
	let activeIndex = $state(0);
	let inputEl = $state<HTMLInputElement | null>(null);
	let loadError = $state(false);

	const MAX_RESULTS = 8;

	const results = $derived.by<Post[]>(() => {
		if (!fuse) return [];
		const q = query.trim();
		if (!q) return allPosts.slice(0, MAX_RESULTS);
		return fuse
			.search(q)
			.slice(0, MAX_RESULTS)
			.map((r) => r.item);
	});

	$effect(() => {
		if (open) {
			void ensureLoaded();
			queueMicrotask(() => inputEl?.focus());
		} else {
			query = '';
		}
	});

	// Clamp the cursor whenever results change so it never points past the end.
	$effect(() => {
		if (activeIndex >= results.length) activeIndex = 0;
	});

	async function ensureLoaded() {
		if (fuse) return;
		try {
			const index = await loadSearchIndex();
			fuse = index.fuse;
			allPosts = index.posts;
		} catch {
			loadError = true;
		}
	}

	function close() {
		open = false;
	}

	function selectResult(post: Post) {
		close();
		void goto(`/blog/${post.slug}`);
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			close();
		} else if (event.key === 'ArrowDown') {
			event.preventDefault();
			if (results.length) activeIndex = (activeIndex + 1) % results.length;
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			if (results.length) activeIndex = (activeIndex - 1 + results.length) % results.length;
		} else if (event.key === 'Enter') {
			const post = results[activeIndex];
			if (post) {
				event.preventDefault();
				selectResult(post);
			}
		}
	}
</script>

{#if open}
	<div
		class="modal modal-open modal-top"
		role="dialog"
		aria-modal="true"
		aria-label="Search posts"
		tabindex="-1"
		onkeydown={onKeydown}
	>
		<!-- Backdrop: clicking closes the modal -->
		<button
			type="button"
			class="modal-backdrop bg-black/50"
			aria-label="Close search"
			onclick={close}
		></button>

		<div class="modal-box max-w-2xl w-full mx-auto mt-20 p-0 overflow-hidden">
			<div class="flex items-center gap-2 px-4 py-3 border-b border-base-300">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5 text-base-content/60 shrink-0"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
					/>
				</svg>
				<input
					bind:this={inputEl}
					bind:value={query}
					type="text"
					placeholder="Search posts by title, description, or category..."
					class="flex-1 bg-transparent outline-none text-base placeholder:text-base-content/50"
					aria-label="Search query"
				/>
				<kbd class="kbd kbd-sm hidden sm:inline-flex">Esc</kbd>
			</div>

			<div class="max-h-[60vh] overflow-y-auto py-2">
				{#if loadError}
					<p class="px-4 py-6 text-sm text-error">Could not load posts. Please try again.</p>
				{:else if !fuse}
					<p class="px-4 py-6 text-sm text-base-content/60">Loading...</p>
				{:else if results.length === 0}
					<p class="px-4 py-6 text-sm text-base-content/60">
						No posts found{query ? ` for "${query}"` : ''}.
					</p>
				{:else}
					<ul class="flex flex-col">
						{#each results as post, i (post.slug)}
							<li>
								<button
									type="button"
									class="w-full text-left px-4 py-3 transition-colors {i === activeIndex
										? 'bg-base-200'
										: 'hover:bg-base-200'}"
									onclick={() => selectResult(post)}
									onmouseenter={() => (activeIndex = i)}
								>
									<div class="font-medium text-base-content">{post.title}</div>
									<div class="text-sm text-base-content/70 line-clamp-1 mt-0.5">
										{post.description}
									</div>
									<div
										class="flex items-center gap-2 text-xs text-base-content/60 mt-1.5 flex-wrap"
									>
										<time>{formatDate(post.date)}</time>
										{#if post.categories?.length}
											<span>·</span>
											<div class="flex gap-1 flex-wrap">
												{#each post.categories as category (category)}
													<span class="badge badge-outline badge-xs">{category}</span>
												{/each}
											</div>
										{/if}
									</div>
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</div>

			<div
				class="px-4 py-2 border-t border-base-300 text-xs text-base-content/60 flex items-center gap-3 flex-wrap"
			>
				<span class="flex items-center gap-1">
					<kbd class="kbd kbd-xs">↑</kbd><kbd class="kbd kbd-xs">↓</kbd> navigate
				</span>
				<span class="flex items-center gap-1">
					<kbd class="kbd kbd-xs">↵</kbd> open
				</span>
				<span class="flex items-center gap-1">
					<kbd class="kbd kbd-xs">Esc</kbd> close
				</span>
			</div>
		</div>
	</div>
{/if}
