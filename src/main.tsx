import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import '@/styles/index.css';

const app = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

app.render(
  <Router>
    <App />
  </Router>,
);
