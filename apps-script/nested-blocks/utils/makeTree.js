function findHelper(body, from) {
    var helper;

    if (from) {
      helper = body.findText(helper_rgx, from);
    } else {
      helper = body.findText(helper_rgx);
    }

    if (helper) {
      var element = helper.getElement();
      var text = element.getText();
      var tokens = text.match(helper_rgx_literal);
      var parent = element.getParent();
      var index = body.getChildIndex(parent);

      return {
        parent: parent,
        range: helper,
        text: text,
        type: tokens[2].split(' ').shift(),
        subtype: tokens[1] === '#' ? 'open' : 'close',
        expression: tokens[1] + tokens[2],
        index: index
      };
    }
  }

  function findHelpers(body, helpers) {
    if (!helpers) {
      helpers = [];
    }

    var lastHelper = helpers[helpers.length - 1];
    var from = lastHelper && lastHelper.range;
    var helper = findHelper(body, from);

    if (!helper) {
      return helpers;
    }

    helpers.push(helper);
    return findHelpers(body, helpers);
  }

  function findMatchingHelperIndex(helpers, openHelper) {
    var childCounter = 0;
    return helpers.findIndex(function(helper) {
      // look for helpers with the same type
      if (openHelper.type === helper.type) {
        if (helper.subtype === 'open') {
          childCounter++;
          return;
        }
        else if (helper.subtype === 'close' && childCounter > 0) {
          childCounter--;
          return;
        }
        return helper;
      }
    });
  }

  function findPairs(helpers, pairs) {
    if (!pairs) {
      pairs = [];
    }

    var head = helpers[0];
    var tail = helpers.slice(1);

    var closeIndex = findMatchingHelperIndex(tail, head);
    var close = tail[closeIndex];
    var children = tail.slice(0, closeIndex);
    var rest = tail.slice(closeIndex + 1);

    head && close && pairs.push({
      open: head,
      close: close,
      children: findPairs(children)
    });

    if (rest.length) {
      return findPairs(rest, pairs);
    }
    return pairs;
  }

  function makeTree(body) {
    return findPairs(findHelpers(body));
  }

