import urllib
import json
import os

from flask import Flask
from flask import request
from flask import make_response
from predictStocks import predictStocks
from twitter_analyze import twitter_analyze
from yahoo_finance import Share
from datetime import datetime, timedelta
import requests
# import mysql.connector

app = Flask(__name__)

# cnx = mysql.connector.connect(user=os.environ['JW_USERNAME'], password=os.environ['JW_KEY'], host=os.environ['JW_HOST'], database='xcqk05aruwtw0kew')

@app.route('/webhook', methods=['POST'])
def webhook():
    req = request.get_json(silent=True, force=True)

    print("Request:")
    print(json.dumps(req, indent=4))

    res = processRequest(req)

    res = json.dumps(res, indent=4)
    print(res)
    r = make_response(res)
    r.headers['Content-Type'] = 'application/json'
    print r
    return r

def processRequest(req):
    result = req.get("result")
    parameters = result.get("parameters")
    stock_symbol = parameters.get("stock_symbol")

    # logMessage(req)

    if req.get("result").get("action") == "CurrentPrice.price":   
        res = makeWebhookResult(getStockCurrentPrice(req), req, stock_symbol)
        return res
    elif req.get("result").get("action") == "Prediction.stockForecast":
        res = makeWebhookResult(getStockPrediction(req), req, stock_symbol)
        return res 
    elif req.get("result").get("action") == "Feelings.analyze":
        res = makeWebhookResult(getTwitterFeelings(req), req, stock_symbol)
        return res
    elif req.get("result").get("action") == "DividendDate.Date":
        res = makeWebhookResult(getStockDividendPayDate(req), req, stock_symbol)
        return res
    elif req.get("result").get("action") == "Stock.info":
        res = makeWebhookResult(getStockInfo(req), req, stock_symbol)
        return res
    elif req.get("result").get("action") == "Stock.historical":
        res = makeWebhookResult(getHistoricalData(req), req, stock_symbol)
        return res
    elif req.get("result").get("action") == "Decision.Classification":
        res = makeWebhookResult(getStockClassification(req), req, stock_symbol)
        return res 
    elif req.get("result").get("action") == "input.welcome":
        res = makeWebhookResult(getWelcome(req), req, stock_symbol)
        return res
    elif req.get("result").get("action") == "Visualize.chart":
        res = makeWebhookResult(getChartURL(req), req, stock_symbol)
        return res
    else:
        return {}

    #gif example

    # Image example
    # "data": {
    #     "facebook": {
    #       "attachment": {
    #         "type": "image",
    #         "payload": {
    #         "url": "https://www.testclan.com/images/testbot/siege/weapons/assault-rifles.jpg"
    #          }
    #         }
    #       }
    #     }

    # quick reply template
  #   "message":{
  #   "text":"Pick a color:",
  #   "quick_replies":[
  #     {
  #       "content_type":"text",
  #       "title":"Red",
  #       "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_RED"
  #     },
  #     {
  #       "content_type":"text",
  #       "title":"Green",
  #       "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
  #     }
  #   ]
  # }

def getStockPrediction(req):
    result = req.get("result")
    parameters = result.get("parameters")
    stock_symbol = parameters.get("stock_symbol")

    time = parameters.get("date-period")

    if stock_symbol is None:
        return None

    num_of_days = 3
    if time != '' and time is not None:
        num_of_days = extract_days(time)

    prediction = predictStocks()
    predicted_values = prediction.stocksRegression(stock_symbol, int(num_of_days))
    predicted_list = predicted_values.tolist()
    clean_list = cleanPrediction(predicted_list)

    return '\n'.join(str(v) for v in clean_list)

def getChartURL(req):
    result = req.get("result")
    parameters = result.get("parameters")
    stock_symbol = parameters.get("stock_symbol")
    chart_url = "https://www.etoro.com/markets/" + stock_symbol + "/chart"
    return chart_url

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))

    print "Starting app on port %d" % port

    app.run(debug=False, port=port, host='0.0.0.0')
