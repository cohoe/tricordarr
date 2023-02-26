// https://www.sohamkamani.com/javascript/enums/
// https://12factor.net/config
// https://medium.com/differential/managing-configuration-in-react-native-cd2dfb5e6f7b
// https://github.com/luggit/react-native-config

import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import EncryptedStorage from 'react-native-encrypted-storage';

export class AppSettings {
  key: string;
  isSecure: boolean;
  dataType: any;
  title: string;
  description: string;

  // @TODO make these consistent
  static SERVER_URL = new AppSettings('SERVER_URL', false, String, 'Server URL', 'URL of the Twitarr server.');
  static USERNAME = new AppSettings('username');
  static URL_PREFIX = new AppSettings('URL_PREFIX');
  static AUTH_TOKEN = new AppSettings('token', true);
  static SHIP_SSID = new AppSettings(
    'SHIP_SSID',
    false,
    String,
    'WiFi Network',
    'Configure the SSID of the ship WiFi. Influences notification checking behavior.',
  );
  static NOTIFICATION_POLL_INTERVAL = new AppSettings(
    'NOTIFICATION_POLL_INTERVAL',
    false,
    Number,
    'Notification Poll Interval',
    'How often to check for new notifications from the server.',
  );
  static USER_ID = new AppSettings('USER_ID');

  constructor(
    key: string,
    isSecure: boolean = false,
    dataType: any = String,
    title: string = '',
    description: string = '',
  ) {
    this.key = key;
    this.isSecure = isSecure;
    this.dataType = dataType;
    this.title = title;
    this.description = description;
  }

  async getValue() {
    if (this.isSecure) {
      return await EncryptedStorage.getItem(this.key);
    }
    return await AsyncStorage.getItem(this.key);
  }

  async setValue(newValue: string) {
    console.log('SAVING SETTING', this.key, newValue);
    if (this.isSecure) {
      return await EncryptedStorage.setItem(this.key, newValue);
    }
    return await AsyncStorage.setItem(this.key, newValue);
  }

  async remove() {
    if (this.isSecure) {
      return await EncryptedStorage.removeItem(this.key);
    }
    return await AsyncStorage.removeItem(this.key);
  }
}

// @TODO deprecate this.
const SettingKeys = Object.freeze({
  SERVER_URL: 'SERVER_URL',
});

// @TODO deprecate this.
export async function initialSettings() {
  console.log('Doing initial settings');
  try {
    await AppSettings.NOTIFICATION_POLL_INTERVAL.remove();
    await AppSettings.NOTIFICATION_POLL_INTERVAL.setValue('60000');
    await AsyncStorage.setItem('URL_PREFIX', '/api/v3');
    let setting = await AsyncStorage.getItem(SettingKeys.SERVER_URL);
    if (setting === null && Config.SERVER_URL !== undefined) {
      await AsyncStorage.setItem(SettingKeys.SERVER_URL, Config.SERVER_URL);
    } else {
      console.log('Server URL is already set');
    }
    let wifi = await AppSettings.SHIP_SSID.getValue();
    if (wifi === null && Config.SHIP_SSID !== undefined) {
      await AppSettings.SHIP_SSID.setValue(Config.SHIP_SSID);
    } else {
      console.log('Ship WiFi is already set');
    }
  } catch (e) {
    console.error(e);
  }
  console.log('Server URL is:', await AsyncStorage.getItem(SettingKeys.SERVER_URL));
}
