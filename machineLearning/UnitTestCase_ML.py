import unittest
from predictStocks import predictStocks


class TestMLMethods(unittest.TestCase):

	def testCurrentPriceType(self):
		prediction = predictStocks()
		current_price = prediction.getCurrentPrice('GOOGL')
		print type(current_price)
		self.assertTrue(isinstance(current_price, float))

	# check if positive
	def testCurrentPriceSign(self):
		prediction = predictStocks()
		current_price = prediction.getCurrentPrice('TSLA')
		self.assertTrue(current_price > 0.0)

	# check if dividend date info is avaliable
	def testDividendPayDate(self):
		prediction = predictStocks()
		date = prediction.getDividendPayDate('AAPL')
		self.assertTrue(date is not None)

	# test for Linear Regression 
	def testPredictionTime(self):
		prediction = predictStocks()
		predicted_values = prediction.stocksRegression('AAPL', 5)
		predicted_list = predicted_values.tolist()
		self.assertTrue(len(predicted_list) == 5)

	# test for Neural Net
	def testPredictionTimeNN(self):
		prediction = predictStocks()
		predicted_values = prediction.stocksNeuralNet('AAPL', 5)
		predicted_list = predicted_values.tolist()
		self.assertTrue(len(predicted_list) == 5)

if __name__ == '__main__':
    unittest.main()
    # unittest.testPredictionTime()