import { RUNTIME_MESSAGES } from "@/general/constants";
import { browser, browserIsValidTabUrl, sendRuntimeMessage } from "./utils";

export class TabIndex {
	browserTabIdToUrl: Map<any, any>;
	browserTabs: Map<any, any>;
	canvasTabs: Map<any, any>;

	constructor() {
		this.browserTabIdToUrl = new Map();
		this.browserTabs = new Map();
		this.canvasTabs = new Map();
	}

	// Common methods
	counts() {
		return {
			browserTabs: this.browserTabs.size,
			canvasTabs: this.canvasTabs.size,
			browserTabIdToUrl: this.browserTabIdToUrl.size,
		};
	}

	get browserTabCount() {
		return this.browserTabs.size;
	}
	get canvasTabCount() {
		return this.canvasTabs.size;
	}
	get browserToCanvasDeltaCount() {
		return this.deltaBrowserToCanvas().length;
	}
	get canvasToBrowserDeltaCount() {
		return this.deltaCanvasToBrowser().length;
	}

	getCanvasDocumentIdByTabUrl(url: string): number | undefined {
		return this.canvasTabs.get(url)?.docId;
	}

	getBrowserTabArray(): chrome.tabs.Tab[] {
		return [...this.browserTabs.values()];
	}

	getBrowserTabByID(id: number) {
		let url = this.browserTabIdToUrl.get(id);
		return this.browserTabs.get(url);
	}

	insertBrowserTab(tab: ICanvasTab) {
		if (!tab.id || !tab.url)
			return console.error("background.js | Invalid tab object: ", tab);
		this.browserTabIdToUrl.set(tab.id, tab.url);
		this.browserTabs.set(tab.url, this.#stripTabProperties(tab));
	}

	removeBrowserTab(url: string) {
		let tab = this.browserTabs.get(url);
		this.browserTabIdToUrl.delete(tab.id);
		this.browserTabs.delete(url);
	}

	insertBrowserTabArray(tabArray: ICanvasTab[], clear = true) {
		if (clear) {
			this.browserTabs.clear();
			this.browserTabIdToUrl.clear();
		}

		tabArray.forEach((tab) => this.insertBrowserTab(tab));
	}

	hasBrowserTab(url: string) {
		return this.browserTabs.has(url);
	}

	clearBrowserTabs() {
		this.browserTabIdToUrl.clear();
		this.browserTabs.clear();
	}

	async updateBrowserTabs() {
		console.log("background.js | Updating browser tabs in index");
		try {
			browser.tabs.query({}, tabs => {
				console.log(
					`background.js | Found ${tabs.length} open browser tabs, updating index`
				);
	
				const processedTabs = tabs.reduce((acc, tab) => {
					if (tab.url && browserIsValidTabUrl(tab.url)) {
						acc.push(this.#stripTabProperties(tab) as never);
					}
					return acc;
				}, []);
	
				this.insertBrowserTabArray(processedTabs);

				sendRuntimeMessage({ type: RUNTIME_MESSAGES.index_get_deltaCanvasToBrowser, payload: index.deltaCanvasToBrowser() });
        sendRuntimeMessage({ type: RUNTIME_MESSAGES.index_get_deltaBrowserToCanvas, payload: index.deltaBrowserToCanvas() });
			});
		} catch (error) {
			console.error("background.js | Error updating browser tabs:", error);
			throw error; // Or handle it as you see fit
		}
	}

	insertCanvasTab(tab: ICanvasTab) {
		this.canvasTabs.set(tab.url, this.#stripTabProperties(tab));
	}

	removeCanvasTab(url: string) {
		this.canvasTabs.delete(url);
	}

	insertCanvasTabArray(tabArray: ICanvasTab[], clear = true) {
		if (clear) this.canvasTabs.clear();
		console.log(
			"background.js | Inserting canvas tab array in index: ",
			tabArray.length
		);
		tabArray.forEach((tab) => this.insertCanvasTab(tab));
	}

	hasCanvasTab(url: string) {
		return this.canvasTabs.has(url);
	}

	getCanvasTabArray() {
		return [...this.canvasTabs.values()];
	}

	clearCanvasTabs() {
		this.canvasTabs.clear();
	}

	deltaBrowserToCanvas() {
		console.log("background.js | Computing delta browser to canvas");
		return [...this.browserTabs.values()].filter(
			(tab) => !this.canvasTabs.has(tab.url)
		);
	}

	deltaCanvasToBrowser() {
		console.log("background.js | Computing delta canvas to browser");
		return [...this.canvasTabs.values()].filter(
			(tab) => !this.browserTabs.has(tab.url)
		);
	}

	clearIndex() {
		console.log("background.js | Clearing tab index");
		this.clearBrowserTabs();
		this.clearCanvasTabs();
	}

	#stripTabProperties(tab: ICanvasTab) {
		return {
			id: tab.id,
			docId: tab.docId,
			index: tab.index,

			url: tab.url,
			title: tab.title,
			favIconUrl: tab.favIconUrl ? tab.favIconUrl : browser.runtime.getURL('icons/logo_64x64.png'),

			// Restore may fail if windowId does not exist hence omitted
			// TODO: Handle this case with windows.create()
			// windowId: tab.windowId,
			highlighted: tab.highlighted,
			active: tab.active,
			pinned: tab.pinned,

			// hidden: tab.hidden, //removed

			// boolean. Whether the tab is created and made visible in the tab bar without any content
			// loaded into memory, a state known as discarded. The tab's content is loaded when the tab
			// is activated.
			// Defaults to true to conserve memory on restore
			discarded: true, // tab.discarded,
			incognito: tab.incognito,
			//width: 1872,
			//height: 1004,
			//lastAccessed: 1675111332554,
			audible: tab.audible,
			mutedInfo: tab.mutedInfo,

			// removed:
			// isArticle: tab.isArticle,
			// isInReaderMode: tab.isInReaderMode,
			// sharingState: tab.sharingState,
		};
	}
}

const index = new TabIndex();
export default index;