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

        //Clean up comments
        delete beautified_cart[k].ingredients;
        delete beautified_cart[k].comments;

        k++;
      }

      if (!duplicateFound) {
        beautified_cart.push(raw_cart[n]);
      }
    }
  }
  return beautified_cart;
}

function frameKotNumber(branch, kotNumber) {
  var kot_id = branch + "_KOT_" + kotNumber;
  return kot_id
}

module.exports = {
  reduceCart,
  frameKotNumber
};
