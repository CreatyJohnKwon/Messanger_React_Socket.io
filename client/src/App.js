import { BrowserRouter as Router } from "react-router-dom"
import RoutesPage from "./Util/RoutesPage"
import { SocketProvider } from './Socket/SocketContext'
import { GlobalStore } from "../src/Store/Store"
import { useEffect } from "react"

function App() {
  const { setPlatform } = GlobalStore()

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isMacOS =
      navigator.userAgent.includes("Macintosh") ||
      navigator.userAgent.includes("Mac OS X");

    if (/iPhone|iPad|iPod/i.test(userAgent)) {
      setPlatform("ios");
    } else if (/Android/i.test(userAgent)) {
      setPlatform("aos");
    } else if (isMacOS) {
      setPlatform("mac");
    } else {
      setPlatform("web");
    }
  }, []);

  return (
    <SocketProvider>
      <Router>
        <RoutesPage />
      </Router>
    </SocketProvider>
  );
}

export default App;
