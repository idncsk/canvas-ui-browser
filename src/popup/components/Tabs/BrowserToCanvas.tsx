import React, { useState } from 'react';
import cx from 'classnames';
import styles from "./BrowserToCanvas.module.scss";
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { setBrowserTabs } from '@/popup/redux/tabs/tabActions';
import { Dispatch } from 'redux';
import { updateTabs } from '@/popup/utils';

interface BrowserToCanvasTypes {
}

const BrowserToCanvas: React.FC<BrowserToCanvasTypes> = ({ }) => {
  const browserTabs = useSelector((state: any) => state.tabs.browserTabs);
  const dispatch = useDispatch<Dispatch<any>>();

  const removeBrowserToCanvasTabClicked = (tab: chrome.tabs.Tab) => {
    console.log('UI | Close icon clicked: ', tab.url);
    if(!tab.id) return;
    chrome.tabs.remove(tab.id);

    // Remove the tab from the list
    dispatch(setBrowserTabs(browserTabs.filter((t: chrome.tabs.Tab) => t.id !== tab.id)));
    // setBrowserToCanvasTabsDelta(btctd => {
    //   return btctd.filter(b => tab.id !== b.id);
    // });
  };

  const syncAllClicked = () => {
    console.log('UI | Syncing all tabs to canvas');
    chrome.runtime.sendMessage({ action: 'canvas:tabs:insert' }).then((res) => {
        console.log('UI | Res: ' + res)
        // updateTabs(dispatch);
    }).catch((error) => {
        console.error('UI | Error syncing tabs to canvas:', error);
    });
  }

  return (
    <div className="container">
      <h5>Sync to Canvas
        (<span className="">{browserTabs.length}</span>)
        <span>
          <a onClick={syncAllClicked}
            className="black white-text waves-effect waves-light btn-small right">
            Sync all
            <i className="material-icons right">sync</i>
          </a>
        </span>
      </h5>
      <ul className="collection">
        {
          !browserTabs.length ? 
          (<li className="collection-item">No browser tabs to sync</li>) : 
          browserTabs.map((tab: chrome.tabs.Tab, idx: number) => {
            if(!tab.url) return null;
            return <li key={idx + tab.url} className="collection-item" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <a 
                href={tab.url}
                style={{ textDecoration: "none", flexGrow: "1" }} 
                className="tab-title truncate black-text"
                onClick={(e) => {
                  e.preventDefault();
                  console.log('UI | Tab clicked: ', tab.url);
                }}
              >
                <img 
                  src={tab.favIconUrl || ""}
                  style={{ width: "16px", height: "16px", marginRight: "8px" }}
                />
                {tab.title || ""}
              </a>
              <i 
                className="material-icons"
                style={{ cursor: "pointer" }}
                title="Close tab"
                onClick={(e) => { e.preventDefault(); removeBrowserToCanvasTabClicked(tab); }}
              >close</i>
            </li>
          })
        }
      </ul>
    </div>
  );
};

export default BrowserToCanvas;