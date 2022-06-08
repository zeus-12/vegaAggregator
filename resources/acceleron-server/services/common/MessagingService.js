
function postMessageRequest(mobileNumber, data, type){

    var postdata = {
        "mobileNumber": "",
        "data": {},
        "type": "DELIVERY_CONFIRMATION"
    }

    $.ajax({
        type: 'POST',
        url: 'https://www.accelerateengine.app/apis/posdeliveryconfirmationsms.php',
        data: JSON.stringify(postdata),
        contentType: "application/json",
        dataType: 'json',
        timeout: 10000,
        success: function(data) {
        }
    });
}
