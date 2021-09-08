const SummaryService = require('./services/SummaryService');
var moment = require('moment');

test('fetch summary based on billing mode from 30-01-2021 to 30-04-2021',async () => {
    var curr_date = moment().format('YYYYMMDD');  
  const data = await SummaryService.fetchSummaryByBillingMode('accelerate_invoices', [
    {
      "name": "Dine In",
      "isDiscountable": true,
      "type": "DINE",
      "maxDiscount": 2000,
      "extras": [
        {
          "name": "SGST",
          "value": "2.50"
        },
        {
          "name": "CGST",
          "value": "2.50"
        }
      ]
    },
    {
      "name": "Delivery",
      "isDiscountable": true,
      "type": "DELIVERY",
      "maxDiscount": 2000,
      "extras": [
        {
          "name": "CGST",
          "value": "2.50"
        },
        {
          "name": "SGST",
          "value": "2.50"
        },
        {
          "name": "Container Charges",
          "value": "5.00"
        }
      ]
    },
    {
      "name": "Takeaway",
      "isDiscountable": true,
      "type": "PARCEL",
      "maxDiscount": 2000,
      "extras": [
        {
          "name": "SGST",
          "value": "2.50"
        },
        {
          "name": "CGST",
          "value": "2.50"
        },
        {
          "name": "Container Charges",
          "value": "3.00"
        }
      ]
    }
  ], 20210130, 20210430, curr_date); 
  expect(data).toBe({
    "code": 200,
    "msg": "success",
    "data": [
        {
            "type": "Billing_Mode",
            "summary": [
                {
                    "mode": "DINE",
                    "sum": 357,
                    "count": 2,
                    "refunds": 44
                },
                {
                    "mode": "DELIVERY",
                    "sum": 110,
                    "count": 1,
                    "refunds": 0
                },
                {
                    "mode": "PARCEL",
                    "sum": 691,
                    "count": 3,
                    "refunds": 0
                }
            ]
        }
    ]
});
});