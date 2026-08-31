"use client";

import { Component } from "react";

/**
 * Client-side error boundary for interactive islands.
 * A render or event-handler crash inside the wrapped subtree shows this
 * fallback instead of unmounting the entire app (Next.js production
 * "Application error: client-side exception" page).
 */
export default class SafeBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("[SafeBoundary]", this.props.label || "island", error, info?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          {this.props.fallbackMessage || "This section could not be loaded."}
        </div>
      );
    }
    return this.props.children;
  }
}
