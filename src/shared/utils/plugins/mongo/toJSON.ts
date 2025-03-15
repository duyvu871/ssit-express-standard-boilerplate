import {Schema} from "mongoose";

/**
 * toJSON plugin to transform returned object
 * @example
 * userSchema.plugin(toJSON);
 *
 * @param obj - object to transform
 * @param path - path to the field to delete
 * @param index - index of the path
 */

const deleteAtPath = (obj: Record<string, any>, path: string[], index: number) => {
	if (index == path.length - 1) {
		delete obj[path[index]];
		return;
	}
	deleteAtPath(obj[path[index]], path, index + 1);
}

const toJSON = (schema: any) => {
	let transform = null;

	// check if the schema has a toJSON transform
	// @ts-ignore
	if (schema.options.toJSON && schema.options.toJSON.transform) {
		// @ts-ignore
		transform = schema.options.toJSON.transform;
	}

	// Add the transform function
	schema.options.toJSON = Object.assign(schema.options.toJSON || {}, {
		transform(doc: any, ret: any, options: any) {
			Object.keys(schema.paths).forEach((path) => {
				// check if the field is private
				if (schema.paths[path].options && schema.paths[path].options.private) {
					deleteAtPath(ret, path.split('.'), 0);
				}
			});

			ret.id = ret._id.toString();
			delete ret._id;
			delete ret.__v;
			delete ret.createdAt;
			delete ret.updatedAt;

			if (transform) {
				// @ts-ignore
				return transform(doc, ret, options);
			}
		} // transform function
	});
}

export default toJSON;

