/* @refresh reload */
import { render } from 'solid-js/web';

import './index.css';
import App from './App';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

render(() => <App />, root!);

let timeoutId: number;

function resetTimer() {
  // Clear the previous timeout, if any
  if (timeoutId) {
    document.body.classList.remove("nocursor");
    clearTimeout(timeoutId);
  }

  // Set a new timeout for 2 seconds
  timeoutId = setTimeout(runFunctionAfterInactivity, 2000);
}

function runFunctionAfterInactivity() {
  document.body.classList.add("nocursor");
}

// Add event listeners to track mouse movement
document.addEventListener("mousemove", resetTimer);

resetTimer()
