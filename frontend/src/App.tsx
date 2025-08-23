import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Pages/Login';
import Home from './Pages/Home';
import Products from './Pages/Products';
import Users from './Pages/Users';
import Departments from './Pages/Departments';
import Layout from './Components/Layout';
import Perfil from './Pages/Perfil';
import './App.css';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Layout><Home /></Layout>} />
        <Route path="/produtos" element={<Layout><Products /></Layout>} />
        <Route path="/usuarios" element={<Layout><Users /></Layout>} />
        <Route path="/departamentos" element={<Layout><Departments /></Layout>} />
        <Route path="/perfil" element={<Layout><Perfil /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
