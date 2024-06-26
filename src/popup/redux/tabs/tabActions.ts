import { SET_BROWSER_TABS, BrowserTabActionTypes, CanvasTabActionTypes, SET_CANVAS_TABS, ADD_CANVAS_TABS, REMOVE_CANVAS_TABS, ADD_BROWSER_TABS, REMOVE_BROWSER_TABS, SET_OPENED_CANVAS_TABS, ADD_OPENED_CANVAS_TABS, REMOVE_OPENED_CANVAS_TABS, SET_SYNCED_BROWSER_TABS, ADD_SYNCED_BROWSER_TABS, REMOVE_SYNCED_BROWSER_TABS,  } from './tabActionTypes';

export const setBrowserTabs = (tabs: ICanvasTab[]): BrowserTabActionTypes => ({
  type: SET_BROWSER_TABS,
  payload: tabs,
});

export const addBrowserTabs = (tabs: ICanvasTab[]): BrowserTabActionTypes => ({
  type: ADD_BROWSER_TABS,
  payload: tabs,
});

export const removeBrowserTabs = (tabs: ICanvasTab[]): BrowserTabActionTypes => ({
  type: REMOVE_BROWSER_TABS,
  payload: tabs,
});


export const setCanvasTabs = (tabs: ICanvasTab[]): CanvasTabActionTypes => ({
  type: SET_CANVAS_TABS,
  payload: tabs,
});

export const addCanvasTabs = (tabs: ICanvasTab[]): CanvasTabActionTypes => ({
  type: ADD_CANVAS_TABS,
  payload: tabs,
});

export const removeCanvasTabs = (tabs: ICanvasTab[]): CanvasTabActionTypes => ({
  type: REMOVE_CANVAS_TABS,
  payload: tabs,
});



export const setOpenedCanvasTabs = (tabs: ICanvasTab[]): CanvasTabActionTypes => ({
  type: SET_OPENED_CANVAS_TABS,
  payload: tabs,
});

export const addOpenedCanvasTabs = (tabs: ICanvasTab[]): CanvasTabActionTypes => ({
  type: ADD_OPENED_CANVAS_TABS,
  payload: tabs,
});

export const removeOpenedCanvasTabs = (tabs: ICanvasTab[]): CanvasTabActionTypes => ({
  type: REMOVE_OPENED_CANVAS_TABS,
  payload: tabs,
});


export const setSyncedBrowserTabs = (tabs: ICanvasTab[]): BrowserTabActionTypes => ({
  type: SET_SYNCED_BROWSER_TABS,
  payload: tabs,
});

export const addSyncedBrowserTabs = (tabs: ICanvasTab[]): BrowserTabActionTypes => ({
  type: ADD_SYNCED_BROWSER_TABS,
  payload: tabs,
});

export const removeSyncedBrowserTabs = (tabs: ICanvasTab[]): BrowserTabActionTypes => ({
  type: REMOVE_SYNCED_BROWSER_TABS,
  payload: tabs,
});