import Home from '../features/public/Home.tsx'

export type RootHandle = {
  title: string
  hideInNavigation?: boolean
  devOnly?: boolean
}

export default function Root() {
  return <Home />
}
