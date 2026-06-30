"use client";
import Link from "next/link";
import { CheckCircle, ArrowRight, Wrench } from "lucide-react";

export default function ObrigadoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-lg w-full">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-white">OficinaPro</span>
        </div>

        {/* Ícone de sucesso */}
        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">
          Cadastro realizado!
        </h1>
        <p className="text-slate-400 text-lg mb-10 leading-relaxed">
          Seu acesso está pronto. Você tem <span className="text-white font-semibold">14 dias grátis</span> para explorar tudo.
        </p>

        {/* CTA principal */}
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-colors text-base"
        >
          Ir para o sistema <ArrowRight className="w-5 h-5" />
        </Link>
        <p className="text-slate-500 text-sm mt-4">
          Comece cadastrando seu primeiro cliente — o sistema te guia passo a passo.
        </p>
      </div>
    </div>
  );
}
