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

console.log(findHelpers(body));
