// Main React app entry point using CommonJS
const React = require('react');
const ReactDOM = require('react-dom/client');
const App = require('./App');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));