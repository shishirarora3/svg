/**
 * Isomorphic SVG icon loader for Webpack
 */

import {runSVGPolyfill} from './svgPolyfill';
const svgsInDom = {};

//http://stackoverflow.com/a/32107845/1429097
const COLOR_NAME_REGEX = /_clr/;
const IE_EDGE_REGEX = /Edge|Trident/;

function memoize(fn, ...rest) {
  let memo;
  return () => {
    if (typeof memo === 'undefined') memo = fn.apply(this, rest);
    return memo;
  };
}
/**
 * Returns true if browser is IE/Edge
 * ref - https://codepen.io/gapcode/pen/vEJNZN
 */
const isIEorEDGE = memoize( () => {
  const _navigator = window.navigator;
  const {appName} = _navigator;

  return appName == 'Microsoft Internet Explorer' || (appName == 'Netscape' && IE_EDGE_REGEX.test( _navigator.appVersion ));
} );

const getSpriteContainer = memoize(() => {
  const containerDiv = document.createElement('div');
  const spriteContainerNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

  containerDiv.appendChild(spriteContainerNode);
  containerDiv.setAttribute('style', 'display:block;width:0;height:0;');
  containerDiv.id = 'svgIcons';

  document.body.insertBefore(containerDiv, document.body.firstChild);
  return spriteContainerNode;
});

/**
 * Get the symbol to be appended to the DOM
 * @param svgContent Content to be used when creating the sprite
 * @param id Id of the symbol to be used.
 * @returns {*} symbol Node to be used
 */
function getSymbol(svgContent, id) {
  // Extract the inner content from svg
  const svgContentWithoutBreaks = svgContent.replace(/\r?\n|\r/gm, '');
  const svgRegexMatches = /(.*?)<svg(.*?)>(.*?)<\/svg>$/gm.exec(svgContentWithoutBreaks);
  const svgInnerText = svgRegexMatches && svgRegexMatches.length && svgRegexMatches[svgRegexMatches.length - 1];
  const viewBoxMatches = /viewBox="(.*?)"(.*)/gm.exec(svgContentWithoutBreaks);
  const viewBox = viewBoxMatches && viewBoxMatches[1];
  const symbolNode = document.createElementNS('http://www.w3.org/2000/svg', 'symbol');

  if (!svgInnerText) {
    return undefined;
  }

  symbolNode.setAttributeNS(null, 'id', `icon-${id}`);
  if (viewBox) {
    symbolNode.setAttributeNS(null, 'viewBox', viewBox);
  }
  symbolNode.innerHTML = svgInnerText;

  return symbolNode;
}

/**
 * Given svg (raw text) strip off the unnecessary content.
 * Refer https://gist.github.com/MoOx/1eb30eac43b2114de73a
 * @param svg  svg (Text content)
 * @returns {*} Svg Content to use
 */
function cleanSvg(svg, id) {
  const cleanedSvg = svg
  // remove xml prolog
    .replace(/<\?xml[\s\S]*?>/gi, '')
    // remove doctype
    .replace(/<!doctype[\s\S]*?>/gi, '')
    // remove comments
    .replace(/<!--[\s\S]*?-->/g, '');

  if (!COLOR_NAME_REGEX.test(id)) {
    // remove hardcoded attributes
    return cleanedSvg.replace(/fill="[a-zA-Z0-9#]+"/gi, '')
    .replace(/stroke="[a-zA-Z0-9#]+"/gi, '')
    .trim();
  }
  return cleanedSvg.trim();
}

function addSvg(item, id) {
  if (svgsInDom[id]) {
    return;
  }
  const symbol = getSymbol(cleanSvg(item, id), id);
  if (symbol) {
    getSpriteContainer().appendChild(symbol);
    svgsInDom[id] = true;
  }
}

/**
 * Add list of svgs To DOM
 * @param svgs
 * @param options
 */
function addSvgsToDom(svgs, options) {
  for (let i = 0; i < svgs.length; i++) {
    const item = svgs[i];
    addSvg(item[1], options.id);
  }
}

function insertSvgs(content, options, id) {
  if (!process.env.BROWSER) {
    return;
  }

  isIEorEDGE() && runSVGPolyfill();

  const insertOptions = Object.assign({
    id
  }, options);

  addSvgsToDom(content, insertOptions);
}

module.exports = insertSvgs;
