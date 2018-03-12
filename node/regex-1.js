'use strict';

const HANDLEBARS_TEMPLATE_RGX = /{{[^#|/]\S*}}/g; 
const HANDLEBARS_LITERAL_RGX = /{{|}}/g

const context = {
  YOUR_NAME: 'Blaine Price',
  DATE: '12/27/1987' 
};

const template = '{{YOUR_NAME}} | {{DATE}}';

const result = template.replace(HANDLEBARS_TEMPLATE_RGX, function(match) {
    const token = match.replace(HANDLEBARS_LITERAL_RGX, '');
    return context[token];
});

console.log(result);

debugger;

