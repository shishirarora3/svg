/**
 * Isomorphic SVG icons loader for Webpack
 */

import path from 'path';
import { stringifyRequest, parseQuery } from 'loader-utils';

module.exports = function loader() {};
module.exports.pitch = function pitch(remainingRequest) {
  if (this.cacheable) {
    this.cacheable();
  }

  const query = parseQuery(this.query);
  const fileName = path.basename(remainingRequest, '.svg');
  const insertSvgsPath = path.join(__dirname, './insertSvgs.js');
  const output = `
    var content = require(${stringifyRequest(this, `!!${remainingRequest}`)});
    var insertSvgs = require(${stringifyRequest(this, `!${insertSvgsPath}`)});

    if (typeof content === 'string') {
      content = [[module.id, content, '']];
    }

    insertSvgs(content, ${JSON.stringify(query)}, '${fileName}');

    module.exports = content.locals || {};
  `;

  return output;
};
