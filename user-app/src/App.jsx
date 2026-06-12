import BrokerWebsite from './BrokerWebsite'
import { AuthProvider } from './AuthContext'
import { SocketProvider } from './SocketContext'

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrokerWebsite />
      </SocketProvider>
    </AuthProvider>
  )
}

export default App
