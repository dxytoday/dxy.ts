import typescript from "rollup-plugin-typescript2";
import { string } from "rollup-plugin-string";

export default {
	input: "./src/Dxy.ts",
	output: [
		{
			file: "./dist/dxy.js",
			format: "esm",
			sourcemap: true,
		},
	],
	plugins: [
		string({ include: ["**/*.glsl"] }),
		typescript(),
	]
};