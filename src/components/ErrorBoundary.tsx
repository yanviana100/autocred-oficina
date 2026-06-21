"use client";
import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center p-8">
          <p className="text-2xl font-bold text-slate-800">Algo deu errado</p>
          <p className="text-slate-500 max-w-sm">Ocorreu um erro inesperado nesta página. Tente novamente ou entre em contato com o suporte.</p>
          <Button onClick={() => this.setState({ hasError: false })}>Tentar novamente</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
