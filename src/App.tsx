import ImageCollection from "./components/ImageCollection";

function App() {
  return (
    <main className="wrapper">
      <ImageCollection maxFileSize={4} contextString={Symbol.for("alarm")} />
    </main>
  );
}

export default App;
