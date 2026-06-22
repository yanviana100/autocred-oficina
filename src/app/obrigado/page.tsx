"use client";
import Link from "next/link";
import { CheckCircle, ArrowRight, Wrench } from "lucide-react";

const WHATSAPP = "5511999999999";
const waUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Olá! Acabei de me cadastrar no OficinaPro e gostaria de agendar a configuração.")}`;

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
        <div className="bg-blue-600 rounded-2xl p-6 mb-6 text-left">
          <p className="text-white font-semibold mb-2">Quer configurar tudo agora com a gente?</p>
          <p className="text-blue-200 text-sm mb-4">Em 20 minutos pelo WhatsApp, sua oficina já está no sistema com os primeiros dados cadastrados.</p>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-white text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-50 transition-colors text-sm"
          >
            Agendar configuração agora <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* CTA secundário */}
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-colors text-sm py-3"
        >
          Prefiro explorar sozinho por agora <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
