import AppRouter from './routes/AppRouter';
import InstallPrompt from './components/pwa/InstallPrompt';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {

  return (
    <>
      <AppRouter />
      <InstallPrompt />
    </>
  )
}


export default App;
