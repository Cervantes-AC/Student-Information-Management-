import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './router'

export default function App(): React.JSX.Element {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}