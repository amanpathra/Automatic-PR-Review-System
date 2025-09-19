import './App.css';
import { Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Callback from './components/Callback';
import Logs from './components/Logs';
import { MyProvider } from './context/userContext';

function App() {
  return (
    <MyProvider>
      <div className="App">
        <Routes>
          <Route exact path="/" element={<Home/>} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/logs" element={<Logs />} />
        </Routes>
      </div>
    </MyProvider>
  );
}

export default App;
