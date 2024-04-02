import React, { useState } from 'react';
import cx from 'classnames';
import styles from "./SyncSettingCheckbox.module.scss";
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { setConfig } from '../redux/config/configActions';
import { Dispatch } from 'redux';

interface SyncSettingCheckboxTypes {
  title: string;
  prop: string;
}

const SyncSettingCheckbox: React.FC<SyncSettingCheckboxTypes> = ({ title, prop }) => {
  const config = useSelector((state: any) => state.config);
  const dispatch = useDispatch<Dispatch<any>>();

  const updateSyncSettings = (config: IConfig, changes: { [key: string]: any }) => {
    const sync = { ...config.sync, ...changes };
    chrome.runtime.sendMessage({ action: 'config:set:item', key: "sync", value: sync }, (response) => {
      dispatch(setConfig({ ...config, sync }));
    });
  }

  return (
    <div className="row">
      <div className="col s10">{title}</div>
      <div className="col s2">
        <div className="switch">
          <label>
            <input
              type="checkbox"
              checked={config.sync[prop]}
              onChange={(e) => updateSyncSettings(config, { [prop]: e.target.checked })}
            />
            <span className="lever"></span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default SyncSettingCheckbox;