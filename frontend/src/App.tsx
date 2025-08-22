import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Login from './Login';
import Home from './Home';
import Products from './Products';
import Departments from './Departments';
import Users from './Users';

function App() {
  return (
    <BrowserRouter>
      <Container className="mt-5">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/produtos" element={<Products />} />
          <Route path="/usuarios" element={<Users />} />
          <Route path="/departamentos" element={<Departments />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}

export default App;
