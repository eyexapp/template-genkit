import { onCallGenkit } from 'firebase-functions/v2/https';
import { exampleFlow } from '../flows/index.js';

export const example = onCallGenkit(exampleFlow);
