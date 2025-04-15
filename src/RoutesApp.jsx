import React from 'react'
import { Route, Routes } from 'react-router-dom';
import StocksFeed from './Stocks/StocksFeed';
const RoutesApp = () => {
  return (
    <div>
              <Routes>
        <Route path="/home/overview" element={<h2>Overview Page</h2>} />
        <Route path="/home/news" element={<h2>News Page</h2>} />
        <Route path="/stocks" element={<StocksFeed />} />
        <Route path="/stocks/analysis" element={<h2>Stock Analysis Page</h2>} />
        <Route path="/trends/crypto" element={<h2>Crypto Trends Page</h2>} />
        <Route path="/trends/stocks" element={<h2>Stock Trends Page</h2>} />
        <Route path="/login" element={<h2>Login Page</h2>} />
        <Route path="/register" element={<h2>Register Page</h2>} />
      </Routes>
    </div>
  )
}

export default RoutesApp
