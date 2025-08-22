import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Login from './Login';
import Home from './Home';

function App() {
  return (
    <BrowserRouter>
      <Container className="mt-5">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}

export default App;
