import { mount } from 'svelte';
import App from './App.svelte';
import './app.css';

// The app's <aside> and <main> are the body's grid columns (see app.css).
mount(App, { target: document.body });
