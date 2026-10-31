import { Component } from 'react'
import { RotateCcw, Dumbbell } from 'lucide-react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('UV Gym crashed:', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="grid min-h-[60vh] place-items-center p-6">
        <div className="glass max-w-md p-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-danger/15">
            <Dumbbell className="h-6 w-6 -rotate-45 text-danger" />
          </div>
          <h2 className="text-xl font-bold">Oops — we dropped the bar.</h2>
          <p className="mt-2 text-sm text-muted">
            Something went wrong on this screen. Your progress is safe. Give it another rep?
          </p>
          <button className="btn-primary mt-6" onClick={() => this.setState({ error: null })}>
            <RotateCcw className="h-4 w-4" /> Try again
          </button>
        </div>
      </div>
    )
  }
}
