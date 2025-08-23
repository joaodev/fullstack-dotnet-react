import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Pages/Login';
import Home from './Pages/Home';
import Products from './Pages/Products';
import Users from './Pages/Users';
import Departments from './Pages/Departments';
import Layout from './Components/Layout';
import './App.css';


function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/produtos" element={<Products />} />
          <Route path="/usuarios" element={<Users />} />
          <Route path="/departamentos" element={<Departments />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
