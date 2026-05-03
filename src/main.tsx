import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

const root = document.getElementById('root');
if (!root) throw new Error('Root element #root not found');

// React 16 API; bumping to 18 + createRoot is a follow-up phase per ROADMAP.
ReactDOM.render(<App />, root);
