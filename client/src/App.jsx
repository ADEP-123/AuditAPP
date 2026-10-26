import AppHeader from './presentation/components/AppHeader.jsx';
import HomePage from './presentation/pages/HomePage.jsx';
import FrameworkList from './presentation/components/FrameworkList.jsx';

export default function App() {
  return (
    <>
      <AppHeader />
      <main className="container">
        <HomePage />
        <FrameworkList />
      </main>
    </>
  );
}
