import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import LandingPage from './components/LandingPage/LandingPage.jsx'
import TodoList from './components/TodoList/TodoList.jsx'
import Timetable from './components/Timetable/Timetable.jsx'
import Notes from './components/Notes/Notes.jsx'

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/pen2pdf" element={<App />} />
            <Route path="/todo" element={<TodoList />} />
            <Route path="/timetable" element={<Timetable />} />
            <Route path="/notes" element={<Notes />} />
        </Routes>
    </BrowserRouter>
)
