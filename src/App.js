import { useCallback, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import { Home } from './components/Home';
import About from './components/About';
import NoteState from './context/notes/NoteState';
import { Alert } from './components/Alert';
import Signup from './components/Signup';
import Login from './components/Login';

function App() {
  const [alert, setAlert] = useState(null);
  const timer = useRef(null);

  const showAlert = useCallback((msg, type = 'success') => {
    setAlert({ msg, type });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAlert(null), 2500);
  }, []);

  return (
    <NoteState showAlert={showAlert}>
      <Router>
        <Navbar showAlert={showAlert} />
        <Alert alert={alert} />
        <main className="container nb-main">
          <Routes>
            <Route path="/" element={<Home showAlert={showAlert} />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login showAlert={showAlert} />} />
            <Route path="/signup" element={<Signup showAlert={showAlert} />} />
            <Route path="*" element={<Home showAlert={showAlert} />} />
          </Routes>
        </main>
      </Router>
    </NoteState>
  );
}

export default App;
