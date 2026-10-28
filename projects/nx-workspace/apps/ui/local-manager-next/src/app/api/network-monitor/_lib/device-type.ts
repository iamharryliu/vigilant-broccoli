import { DEVICE_TYPE } from '../../../constants/network-monitor';

interface DeviceTypeInput {
  vendor: string | null;
  hostname: string | null;
  isGateway: boolean;
  isLocallyAdministered: boolean;
}

const HOSTNAME_RULES: Array<[RegExp, string]> = [
  [/iphone/i, 'iPhone'],
  [/ipad/i, 'iPad'],
  [/macbook|imac|mac-?mini|mac-?pro|mac-?studio/i, 'Mac'],
  [/android|pixel/i, 'Android phone'],
  [/chromecast/i, 'Chromecast'],
  [/google-?home|googlehome/i, 'Google Home'],
  [/nest/i, 'Nest device'],
  [/roku/i, 'Roku'],
  [/echo|alexa|amazon/i, 'Amazon Echo'],
  [/firetv|fire-?tv|fire-?stick/i, 'Fire TV'],
  [/appletv|apple-?tv/i, 'Apple TV'],
  [/printer|epson|brother|canon|envy|officejet|laserjet/i, 'Printer'],
  [/xbox/i, 'Xbox'],
  [/playstation|ps[345]/i, 'PlayStation'],
  [/switch|nintendo/i, 'Nintendo'],
  [/raspberrypi|raspi|rpi/i, 'Raspberry Pi'],
  [/synology|qnap|nas/i, 'NAS'],
  [/router|gateway|modem/i, 'Router'],
  [/camera|ipcam|cam-/i, 'Camera'],
  [/tv-?$|smart-?tv|webos|tizen/i, 'TV'],
];

const VENDOR_RULES: Array<[RegExp, string]> = [
  [/sonos/i, 'Sonos speaker'],
  [/roku/i, 'Roku'],
  [/nintendo/i, 'Nintendo'],
  [/sony interactive|playstation/i, 'PlayStation'],
  [/nest labs|google.*nest/i, 'Nest device'],
  [/ring llc|amazon technologies.*ring/i, 'Ring camera'],
  [/wyze/i, 'Wyze camera'],
  [/hikvision|dahua|axis communications/i, 'IP camera'],
  [/philips lighting|signify/i, 'Philips Hue'],
  [/tuya|espressif|shelly|sonoff|tasmota/i, 'Smart home / IoT'],
  [/xiaomi/i, 'Xiaomi device'],
  [/lg electronics|hisense|tcl|vizio|samsung electronics.*tv/i, 'Smart TV'],
  [/hewlett|hp inc/i, 'HP device'],
  [/canon|epson|brother|kyocera|lexmark|xerox/i, 'Printer'],
  [
    /tp-link|netgear|asus.*router|d-link|ubiquiti|eero|linksys|cisco|sagemcom|arris|technicolor|huawei|zte|ruckus|aruba|mikrotik/i,
    'Networking gear',
  ],
  [/raspberry pi/i, 'Raspberry Pi'],
  [/synology|qnap|western digital/i, 'NAS'],
  [/microsoft/i, 'Microsoft device'],
  [/amazon technologies/i, 'Amazon device'],
  [/google/i, 'Google device'],
  [/samsung/i, 'Samsung device'],
  [/apple/i, 'Apple device'],
  [
    /intel|realtek|broadcom|qualcomm|murata|azurewave|wistron|liteon|compal|quanta|pegatron|foxconn/i,
    'PC / Laptop',
  ],
];

const matchFirst = (
  text: string | null,
  rules: Array<[RegExp, string]>,
): string | null => {
  if (!text) return null;
  for (const [pattern, label] of rules) {
    if (pattern.test(text)) return label;
  }
  return null;
};

export const inferDeviceType = ({
  vendor,
  hostname,
  isGateway,
  isLocallyAdministered,
}: DeviceTypeInput): string => {
  if (isGateway) return DEVICE_TYPE.ROUTER;
  const fromHostname = matchFirst(hostname, HOSTNAME_RULES);
  if (fromHostname) return fromHostname;
  const fromVendor = matchFirst(vendor, VENDOR_RULES);
  if (fromVendor) return fromVendor;
  if (isLocallyAdministered) return DEVICE_TYPE.PRIVACY_MAC;
  return DEVICE_TYPE.UNKNOWN;
};
