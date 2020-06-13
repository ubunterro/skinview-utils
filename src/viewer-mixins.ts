import { loadImage, RemoteImage } from "./load-image.js";
import { inferModelType, loadCapeToCanvas, loadSkinToCanvas } from "./process.js";
import { ModelType, TextureCanvas, TextureSource } from "./types.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyMixins(derivedCtor: any, baseCtors: any[]): void {
	baseCtors.forEach(baseCtor => {
		Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
			Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name)!);
		});
	});
}

function isTextureSource(value: TextureSource | RemoteImage): value is TextureSource {
	return value instanceof EventTarget || value instanceof ImageBitmap;
}

export abstract class SkinContainer<T> {
	protected abstract skinLoaded(model: ModelType, options?: T): void;
	protected abstract get skinCanvas(): TextureCanvas;
	protected abstract resetSkin(): void;

	loadSkin(empty: null): void;
	loadSkin(source: TextureSource, model: ModelType | "auto-detect", options?: T): void;
	async loadSkin(source: RemoteImage, model: ModelType | "auto-detect", options?: T): Promise<void>;

	loadSkin(source: TextureSource | RemoteImage | null, model: ModelType | "auto-detect" = "auto-detect", options?: T): void | Promise<void> {
		if (source === null) {
			this.resetSkin();
		} else if (isTextureSource(source)) {
			loadSkinToCanvas(this.skinCanvas, source);
			const actualModel = model === "auto-detect" ? inferModelType(this.skinCanvas) : model;
			this.skinLoaded(actualModel, options);
		} else {
			return (async (): Promise<void> => this.loadSkin(await loadImage(source), model, options))();
		}
	}
}

export abstract class CapeContainer<T> {
	protected abstract capeLoaded(options?: T): void;
	protected abstract get capeCanvas(): TextureCanvas;
	protected abstract resetCape(): void;

	loadCape(empty: null): void;
	loadCape(source: TextureSource, options?: T): void;
	async loadCape(source: RemoteImage, options?: T): Promise<void>;

	loadCape(source: TextureSource | RemoteImage | null, options?: T): void | Promise<void> {
		if (source === null) {
			this.resetCape();
		} else if (isTextureSource(source)) {
			loadCapeToCanvas(this.capeCanvas, source);
			this.capeLoaded(options);
		} else {
			return (async (): Promise<void> => this.loadCape(await loadImage(source), options))();
		}
	}
}
