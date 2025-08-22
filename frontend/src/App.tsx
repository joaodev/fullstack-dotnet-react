import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Login from './Pages/Login';
import Home from './Pages/Home';
import Products from './Pages/Products';
import Users from './Pages/Users';
import Departments from './Pages/Departments';


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
