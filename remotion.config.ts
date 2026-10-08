import { Config } from '@remotion/cli/config';

import { comAtalhos } from './scripts/lib/webpack';

// PNG nos frames intermediários: capturas de tela e textos miúdos borram com JPEG.
Config.setVideoImageFormat('png');
Config.setCodec('h264');
Config.setCrf(16);
Config.setPixelFormat('yuv420p');
Config.setOverwriteOutput(true);
Config.setEntryPoint('src/index.ts');
Config.overrideWebpackConfig(comAtalhos);
