var helper_rgx = '{{(#|\/)(.*)}}';
var helper_rgx_literal = new RegExp(helper_rgx);
var docID = "1v0kQWTJnFrXE5xaSfYQLx779NG68ON-7JHm5iGp44co";

var context = {
  AWS: true,
  AZURE: false,
  ELK: true,
  PDF: false,
  SPLUNK: true
};

function nestedBlockDocumentGenerator() {
  var original = DriveApp.getFileById(docID);
  var copy = original.makeCopy('Document Copy');
  var output = DocumentApp.openById(copy.getId());
  var body = output.getBody();

  evaluateHelpers(makeTree(body), body, context);
}
