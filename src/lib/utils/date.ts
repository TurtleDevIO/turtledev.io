export const formatDate = (dateString: string) => {
	const [year, month, day] = dateString.split('-').map(Number);
	const date = new Date(year, month - 1, day);
	return date.toLocaleDateString('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric'
	});
};
