import ImageCollection from "./components/ImageCollection";

function App() {
  return (
    <main className="wrapper">
      <ImageCollection maxFileSize={4} />
    </main>
  );
}

export default App;
