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

function findHelper(body, from) {
    if (!from) {
        from = 0;
    }
    const helper = body.slice(from).match(helper_rgx);
    return helper && {
        text: helper[0],
        type: helper[1] === '#' ? 'open' : 'close',
        expression: helper[2].split(' ').shift(),
        index: helper.index + from,
        end: helper.index + from + helper[0].length
    };
}

function findHelpers(body, helpers) {
    if (!helpers) {
        helpers = [];
    }

    const lastHelper = helpers[helpers.length - 1];
    const from = lastHelper && lastHelper.end;
    const helper = findHelper(body, from)

    if (!helper) {
        return helpers;
    }

    helpers.push(helper);
    return findHelpers(body, helpers);
}

function findMatchingHelperIndex(helpers, openHelper) {
    let childCounter = 0
    return helpers.findIndex(function(helper) {
        // Look for helpers of the same expression.
        if (openHelper.expression === helper.expression) {
            // if we find more open helpers of this type,
            // increment child counter
            if (helper.type === 'open') {
                childCounter++;
                return;
            }
            // if we find a close helper of this type while
            // child counter is nonzero, decrement it.
            else if (helper.type === 'close' && childCounter > 0) {
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

/*
[
    {
      "open": {
        "text": "{{#if AWS}}",
        "type": "open",
        "expression": "if",
        "index": 1,
        "end": 12
      },
      "close": {
        "text": "{{/if}}",
        "type": "close",
        "expression": "if",
        "index": 139,
        "end": 146
      },
      "children": [
        {
          "open": {
            "text": "{{#has CLOUD_PROVIDERS azure}}",
            "type": "open",
            "expression": "has",
            "index": 14,
            "end": 44
          },
          "close": {
            "text": "{{/has}}",
            "type": "close",
            "expression": "has",
            "index": 97,
            "end": 105
          },
          "children": [
            {
              "open": {
                "text": "{{#eq LOGGER ELK}}",
                "type": "open",
                "expression": "eq",
                "index": 46,
                "end": 64
              },
              "close": {
                "text": "{{/eq}}",
                "type": "close",
                "expression": "eq",
                "index": 88,
                "end": 95
              },
              "children": [
                {
                  "open": {
                    "text": "{{#if PDF}}",
                    "type": "open",
                    "expression": "if",
                    "index": 66,
                    "end": 77
                  },
                  "close": {
                    "text": "{{/if}}",
                    "type": "close",
                    "expression": "if",
                    "index": 79,
                    "end": 86
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
            "index": 107,
            "end": 128
          },
          "close": {
            "text": "{{/eq}}",
            "type": "close",
            "expression": "eq",
            "index": 130,
            "end": 137
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
        "index": 148,
        "end": 161
      },
      "close": {
        "text": "{{/if}}",
        "type": "close",
        "expression": "if",
        "index": 163,
        "end": 170
      },
      "children": []
    }
  ]
*/
