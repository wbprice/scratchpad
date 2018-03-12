'use strict';

const helper_rgx = /{{(#|\/)(.*)}}/;

const body = `
{{#if AWS}}

{{#has CLOUD_PROVIDERS azure}}

{{#eq LOGGER ELK}}

{{/eq}}

{{/has}}

{{#eq LOGGER splunk}}

{{/eq}}

{{/if}}
`;

function isOpen(helper) {
    return helper.indexOf('{{#') !== -1;
}

function isClose(helper) {
    return helper.indexOf('{{/') !== -1;
}

function findHelper(body, index) {
    const match = helper_rgx.exec(body);
    return match && {
      text: match[0],
      type: match[1] + match[2].split(' ')[0],
      subtype: match[2].split(' ')[0],
      _index: match.index
    }
}

function findHelpers(body, helpers) {
    if (!helpers) {
      helpers = [];
    }
    const helper = findHelper(body);
    
    if (!helper) {
      return helpers;
    }

    helpers.push(helper)
    const startIndex = helper._index + helper.text.length;
    return findHelpers(body.slice(startIndex), helpers);
}

function pairHelpers(helpers, pairs) {
    if (!pairs) {
      pairs = [];
    }

    helpers.forEach((helper, index, helpers) => {
        // find this helper's pair
      helpers.slice(1).some((hlp) => {
        if (helper.subtype === hlp.subtype) {
          if (helper.type !== hlp.type) {
            pairs.push({
              open: helper,
              close: hlp
            })
          }
        } 
      });
    });

  return pairs;
}

console.log(pairHelpers(findHelpers(body)));

