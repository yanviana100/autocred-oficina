export const metadata = { title: "Termos de Uso — OficinaPro" };

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <a href="/" className="text-blue-600 text-sm hover:underline">← Voltar ao início</a>
          <h1 className="text-3xl font-bold text-slate-900 mt-6 mb-2">Termos de Uso</h1>
          <p className="text-slate-500 text-sm">Última atualização: junho de 2025</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700">

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Sobre o serviço</h2>
            <p>OficinaPro é uma plataforma de gestão para oficinas mecânicas, fornecida por <strong>OficinaPro Tecnologia</strong>. Ao criar uma conta e utilizar o serviço, você concorda com estes Termos de Uso.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Uso permitido</h2>
            <p>O serviço destina-se exclusivamente a pessoas jurídicas ou profissionais autônomos que atuam no setor de manutenção e reparação de veículos. É vedado:</p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li>Compartilhar credenciais de acesso com terceiros não autorizados</li>
              <li>Utilizar o sistema para fins ilegais ou que violem direitos de terceiros</li>
              <li>Tentar acessar dados de outras oficinas cadastradas na plataforma</li>
              <li>Reproduzir, copiar ou revender o serviço sem autorização expressa</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">3. Conta e responsabilidades</h2>
            <p>Você é responsável por manter a confidencialidade do seu login e senha. Todas as ações realizadas com sua conta são de sua responsabilidade. Em caso de uso não autorizado, notifique-nos imediatamente pelo e-mail de suporte.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Planos e pagamento</h2>
            <p>O serviço é oferecido em planos mensais com período de teste gratuito de 14 dias, sem necessidade de cartão de crédito. Após o período de teste, a continuidade do serviço está condicionada à assinatura de um plano pago.</p>
            <p className="mt-3">O cancelamento pode ser feito a qualquer momento. Não realizamos reembolso proporcional de mensalidades já pagas, exceto nos casos previstos no Código de Defesa do Consumidor.</p>
            <p className="mt-3">Oferecemos garantia de satisfação de 30 dias: se você assinar um plano pago e não estiver satisfeito dentro dos primeiros 30 dias, devolvemos o valor integral.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Disponibilidade do serviço</h2>
            <p>Nos esforçamos para manter o serviço disponível 24 horas por dia, 7 dias por semana. No entanto, não garantimos disponibilidade ininterrupta. Manutenções programadas serão comunicadas com antecedência sempre que possível.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Propriedade dos dados</h2>
            <p>Os dados inseridos na plataforma (clientes, veículos, ordens de serviço, orçamentos) são de sua propriedade. A OficinaPro não os utiliza para fins comerciais próprios. Em caso de encerramento da conta, disponibilizamos exportação dos dados mediante solicitação.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Limitação de responsabilidade</h2>
            <p>A OficinaPro não se responsabiliza por perdas decorrentes de uso incorreto da plataforma, falhas de conexão à internet, ou decisões de negócio tomadas com base nas informações exibidas no sistema.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Alterações nos termos</h2>
            <p>Podemos atualizar estes Termos a qualquer momento. Alterações significativas serão comunicadas por e-mail com no mínimo 15 dias de antecedência. O uso continuado do serviço após esse prazo implica concordância com os novos termos.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">9. Lei aplicável</h2>
            <p>Estes Termos são regidos pelas leis brasileiras. Fica eleito o foro da comarca de São Paulo/SP para dirimir quaisquer controvérsias, salvo disposição legal em contrário.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">10. Contato</h2>
            <p>Dúvidas sobre estes Termos podem ser enviadas pelo nosso <strong>canal oficial de atendimento (em implantação)</strong>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
