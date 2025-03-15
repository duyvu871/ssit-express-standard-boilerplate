type SortOrder = 'ascending' | 'descending';

export function quickSortByProperty<T extends Record<string, any>>(arr: T[], property: keyof T, order: SortOrder = 'ascending'): T[] {
	if (arr.length <= 1) {
		return arr;
	}

	const pivot = arr[Math.floor(arr.length / 2)];
	const left: T[] = [];
	const right: T[] = [];

	for (let i = 0; i < arr.length; i++) {
		if (order === 'ascending') {
			if (arr[i][property] < pivot[property]) {
				left.push(arr[i]);
			} else if (arr[i][property] > pivot[property]) {
				right.push(arr[i]);
			}
		} else {
			if (arr[i][property] > pivot[property]) {
				left.push(arr[i]);
			} else if (arr[i][property] < pivot[property]) {
				right.push(arr[i]);
			}
		}
	}

	return [...quickSortByProperty(left, property, order), pivot, ...quickSortByProperty(right, property, order)];
}