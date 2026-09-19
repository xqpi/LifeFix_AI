import { useEffect, useState } from "react";
import api from "./services/api";

function App() {

  const [message, setMessage] = useState("");

  useEffect(() => {

    api.get("/")
      .then((response) => {
        setMessage(response.data.message);
      })
      .catch((error) => {
        console.error(error);
      });

  }, []);

  return (
    <div>
      <h1>LifeFix</h1>

      <p>
        {message}
      </p>
    </div>
  );
}

export default App;