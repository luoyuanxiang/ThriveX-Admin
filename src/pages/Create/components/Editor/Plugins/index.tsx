import breaks from '@bytemd/plugin-breaks';
import frontmatter from '@bytemd/plugin-frontmatter';
import gemoji from '@bytemd/plugin-gemoji';
import gfm from '@bytemd/plugin-gfm';
import highlight from '@bytemd/plugin-highlight';
import math from '@bytemd/plugin-math';
import mediumZoom from '@bytemd/plugin-medium-zoom';

import 'highlight.js/styles/vs2015.css';
import 'katex/dist/katex.css';
import 'rehype-callouts/theme/obsidian';

// 插件
import CodeModalPlugin from './CodeModalPlugin';
import DouyinVideo from './RehypeDouyinVideo';
import Markers from './Markers';
import Callouts from './Callouts';
import Material from './Material';

export default [DouyinVideo(), gfm({ singleTilde: false }), Markers(), gemoji(), math(), highlight(), Callouts(), Material(), breaks(), frontmatter(), mediumZoom(), CodeModalPlugin()];
