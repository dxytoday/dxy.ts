export class LoggerProxy {

	public static isDebug = true;

	public static log(parameters: any | any[]) {

		if (LoggerProxy.isDebug !== true) {

			return;

		}

		if (Array.isArray(parameters)) {

			console.log(...parameters);

		} else {

			console.log(parameters);

		}

	}

	public static warn(parameters: any | any[]) {

		if (LoggerProxy.isDebug !== true) {

			return;

		}

		if (Array.isArray(parameters)) {

			console.warn(...parameters);

		} else {

			console.warn(parameters);

		}

	}

	public static error(parameters: any | any[]) {

		if (LoggerProxy.isDebug !== true) {

			return;

		}

		if (Array.isArray(parameters)) {

			console.error(...parameters);

		} else {

			console.error(parameters);

		}

	}

}
