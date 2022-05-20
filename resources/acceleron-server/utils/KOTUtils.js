function reduceCart(raw_cart) {
  var beautified_cart = [];

  for (var n = 0; n < raw_cart.length; n++) {
    if (n == 0) {
      beautified_cart.push(raw_cart[0]);
    } else {
      var duplicateFound = false;
      var k = 0;
      while (beautified_cart[k]) {
        if (beautified_cart[k].code == raw_cart[n].code) {
          if (beautified_cart[k].isCustom && raw_cart[n].isCustom) {
            if (beautified_cart[k].variant == raw_cart[n].variant) {
              beautified_cart[k].qty = beautified_cart[k].qty + raw_cart[n].qty;
              duplicateFound = true;
              break;
            }
          } else {
            beautified_cart[k].qty = beautified_cart[k].qty + raw_cart[n].qty;
            duplicateFound = true;
            break;
          }
        }

        k++;
      }

      if (!duplicateFound) {
        beautified_cart.push(raw_cart[n]);
      }
    }
  }
  return beautified_cart;
}
function initialisePavmentDetails(kotfile) {}
function cleanUpComments(kotfile) {
  delete kotfile.specialRemarks;
  delete kotfile.allergyInfo;

  var c = 0;
  while (kotfile.cart[c]) {
    delete kotfile.cart[c].ingredients;
    delete kotfile.cart[c].comments;

    c++;
  }
  return kotfile;
}

module.exports = {
  reduceCart,
  initialisePavmentDetails,
  cleanUpComments,
};
