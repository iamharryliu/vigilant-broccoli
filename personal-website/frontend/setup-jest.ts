/* eslint-disable @typescript-eslint/no-explicit-any */
import 'jest-preset-angular/setup-jest';
import { TextEncoder, TextDecoder } from 'util';
declare const global: any;
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
