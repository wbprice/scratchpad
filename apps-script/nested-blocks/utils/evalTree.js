/*
[
    {
        open: {},
        close: {},
        children: [
            {
                open: {},
                close: {},
                children: []
            },
            {
                open: {},
                close: {},
                children: []
            }
        ]
    },
    {
        open: {},
        close: {},
        children: []
    },
]
*/

function evaluateHelpers(tree, body, context) {
    return tree.forEach(function(node) {
        // if this node's open helper evaluates to true
        // Remove the helpers but keep the content.
        // Evaluate the children next.
        if (evaluateExpression(node.open.expression, context)) {
            body.removeChild(node.open.parent);
            body.removeChild(node.close.parent);

            return node.children.length && evaluateHelpers(
                node.children,
                body,
                context
            );
        }
        // if this node's open helper evaluates to false
        // Remove the helpers and all content between them.
        var openIndex = body.getChildIndex(node.open.parent);
        var closeIndex = body.getChildIndex(node.close.parent);
        for (var i = 0; i < closeIndex - openIndex + 1; i++) {
            body.removeChild(body.getChild(openIndex));
        }
    });
}

function evaluateExpression(expression, context) {
    var tokens = expression.split(' ');
    var macro = tokens[0];
    switch(macro) {
        case '#if':
            return context[tokens[1]];
        case '#eq':
        case '#has':
        default:
            return true
    }
}