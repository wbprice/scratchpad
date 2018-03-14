'use strict';

const helper_rgx = /{{(#|\/)(.*)}}/;

const body = `
{{#if AWS}}

{{#has CLOUD_PROVIDERS azure}}

{{#eq LOGGER ELK}}

{{#if PDF}}

{{/if}}

{{/eq}}

{{/has}}

{{#eq LOGGER splunk}}

{{/eq}}

{{/if}}

{{#if AZURE}}

{{/if}}
`;

function findHelper(body) {
    const helper = body.match(helper_rgx);
    return helper && {
        text: helper[0],
        type: helper[2].split(' ').shift(),
        subtype: helper[1] === '#' ? 'open' : 'close',
        expression: helper[1] + helper[2],
        _index: helper.index
    };
}

function findHelpers(body, helpers) {
    if (!helpers) {
        helpers = [];
    }

    const helper = findHelper(body);

    if (!helper) {
        return helpers;
    }

    helpers.push(helper);
    return findHelpers(body.slice(helper._index + helper.text.length), helpers);
}

function findMatchingHelperIndex(helpers, openHelper) {
    let childCounter = 0
    return helpers.findIndex(function(helper) {
        // Look for helpers of the same expression.
        if (openHelper.type === helper.type) {
            // if we find more open helpers of this type,
            // increment child counter
            if (helper.subtype === 'open') {
                childCounter++;
                return;
            }
            // if we find a close helper of this type while
            // child counter is nonzero, decrement it.
            else if (helper.subtype === 'close' && childCounter > 0) {
                childCounter--;
                return;
            }
            // otherwise, return the found helper.
            return helper;
        }
    });
}

function findPairs(helpers, pairs) {
    if (!pairs) {
        pairs = [];
    }

    // Find the first open helper
    const head = helpers[0];
    const tail = helpers.slice(1);

    // Find the matching helper
    const closeIndex = findMatchingHelperIndex(tail, head);
    const close = tail[closeIndex];
    const children = tail.slice(0, closeIndex);
    const rest = tail.slice(closeIndex + 1);

    head && close && pairs.push({
        open: head,
        close,
        children: findPairs(children)
    });

    if (rest.length) {
        return findPairs(rest, pairs);
    }
    return pairs;
}

const tree = findPairs(findHelpers(body));
console.log(JSON.stringify(tree, null, 2))

/*
[
  {
    "open": {
      "text": "{{#if AWS}}",
      "type": "open",
      "expression": "if",
      "_index": 1
    },
    "close": {
      "text": "{{/if}}",
      "type": "close",
      "expression": "if",
      "_index": 2
    },
    "children": [
      {
        "open": {
          "text": "{{#has CLOUD_PROVIDERS azure}}",
          "type": "open",
          "expression": "has",
          "_index": 2
        },
        "close": {
          "text": "{{/has}}",
          "type": "close",
          "expression": "has",
          "_index": 2
        },
        "children": [
          {
            "open": {
              "text": "{{#eq LOGGER ELK}}",
              "type": "open",
              "expression": "eq",
              "_index": 2
            },
            "close": {
              "text": "{{/eq}}",
              "type": "close",
              "expression": "eq",
              "_index": 2
            },
            "children": [
              {
                "open": {
                  "text": "{{#if PDF}}",
                  "type": "open",
                  "expression": "if",
                  "_index": 2
                },
                "close": {
                  "text": "{{/if}}",
                  "type": "close",
                  "expression": "if",
                  "_index": 2
                },
                "children": []
              }
            ]
          }
        ]
      },
      {
        "open": {
          "text": "{{#eq LOGGER splunk}}",
          "type": "open",
          "expression": "eq",
          "_index": 2
        },
        "close": {
          "text": "{{/eq}}",
          "type": "close",
          "expression": "eq",
          "_index": 2
        },
        "children": []
      }
    ]
  },
  {
    "open": {
      "text": "{{#if AZURE}}",
      "type": "open",
      "expression": "if",
      "_index": 2
    },
    "close": {
      "text": "{{/if}}",
      "type": "close",
      "expression": "if",
      "_index": 2
    },
    "children": []
  }
]
*/