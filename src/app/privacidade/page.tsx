export const metadata = { title: "Política de Privacidade — OficinaPro" };

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <a href="/" className="text-blue-600 text-sm hover:underline">← Voltar ao início</a>
          <h1 className="text-3xl font-bold text-slate-900 mt-6 mb-2">Política de Privacidade</h1>
          <p className="text-slate-500 text-sm">Última atualização: junho de 2025 · Em conformidade com a LGPD (Lei nº 13.709/2018)</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700">

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Quem somos</h2>
            <p><strong>Controlador dos dados:</strong> OficinaPro Tecnologia<br />
            <strong>E-mail do encarregado (DPO):</strong> privacidade@oficinaPro.com.br</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Quais dados coletamos</h2>

            <h3 className="font-semibold text-slate-800 mt-4 mb-2">Dados da oficina (titular da conta)</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Nome, e-mail e senha (para criação e autenticação da conta)</li>
              <li>Nome da oficina, CNPJ, telefone, cidade e estado (para personalização do sistema)</li>
              <li>Logo da oficina (opcional, para uso nos documentos gerados)</li>
            </ul>

            <h3 className="font-semibold text-slate-800 mt-4 mb-2">Dados inseridos pela oficina sobre seus clientes</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Nome, telefone e e-mail dos clientes da oficina</li>
              <li>Informações de veículos (marca, modelo, ano, placa)</li>
              <li>Ordens de serviço e orçamentos</li>
            </ul>

            <h3 className="font-semibold text-slate-800 mt-4 mb-2">Dados de uso</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Logs de acesso, endereço IP e dados de navegação para segurança e melhoria do serviço</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">3. Por que coletamos</h2>
            <table className="w-full text-sm border-collapse mt-2">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left p-3 border border-slate-200 font-semibold">Finalidade</th>
                  <th className="text-left p-3 border border-slate-200 font-semibold">Base legal (LGPD)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 border border-slate-200">Prestação do serviço contratado</td>
                  <td className="p-3 border border-slate-200">Execução de contrato (Art. 7º, V)</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 border border-slate-200">Comunicações sobre o serviço e cobranças</td>
                  <td className="p-3 border border-slate-200">Execução de contrato (Art. 7º, V)</td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200">Segurança e prevenção a fraudes</td>
                  <td className="p-3 border border-slate-200">Legítimo interesse (Art. 7º, IX)</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 border border-slate-200">Melhoria do produto e análise de uso</td>
                  <td className="p-3 border border-slate-200">Legítimo interesse (Art. 7º, IX)</td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200">Envio de novidades e conteúdo de marketing</td>
                  <td className="p-3 border border-slate-200">Consentimento (Art. 7º, I)</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Com quem compartilhamos</h2>
            <p>Não vendemos dados pessoais. Compartilhamos apenas com:</p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li><strong>Supabase</strong> — infraestrutura de banco de dados e autenticação</li>
              <li><strong>Vercel</strong> — hospedagem da aplicação</li>
              <li><strong>Processadores de pagamento</strong> — exclusivamente para cobranças</li>
            </ul>
            <p className="mt-3">Todos os fornecedores são contratualmente obrigados a proteger seus dados e não utilizá-los para fins próprios.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Por quanto tempo guardamos</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Dados da conta: enquanto a conta estiver ativa + 5 anos após o encerramento (obrigação fiscal)</li>
              <li>Logs de acesso: 6 meses</li>
              <li>Dados de clientes da oficina: enquanto a conta estiver ativa; exportados ou excluídos mediante solicitação</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Seus direitos (LGPD, Art. 18)</h2>
            <p>Você tem direito a:</p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li><strong>Confirmação e acesso</strong> — saber quais dados temos sobre você</li>
              <li><strong>Correção</strong> — atualizar dados incompletos ou incorretos</li>
              <li><strong>Anonimização ou exclusão</strong> — solicitar a exclusão de dados desnecessários</li>
              <li><strong>Portabilidade</strong> — receber seus dados em formato estruturado</li>
              <li><strong>Revogação do consentimento</strong> — para as finalidades baseadas em consentimento</li>
              <li><strong>Oposição</strong> — contestar tratamentos baseados em legítimo interesse</li>
            </ul>
            <p className="mt-3">Para exercer qualquer desses direitos, envie e-mail para <strong>privacidade@oficinaPro.com.br</strong>. Respondemos em até 15 dias úteis.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Segurança</h2>
            <p>Utilizamos criptografia em trânsito (HTTPS/TLS), controle de acesso por Row Level Security no banco de dados, e autenticação segura via Supabase Auth. Cada oficina acessa exclusivamente os próprios dados.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Cookies</h2>
            <p>Utilizamos apenas cookies essenciais para manter a sessão autenticada. Não utilizamos cookies de rastreamento ou publicidade de terceiros.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">9. Alterações nesta política</h2>
            <p>Atualizações serão publicadas nesta página com nova data. Mudanças relevantes serão comunicadas por e-mail com antecedência mínima de 15 dias.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">10. Contato e encarregado (DPO)</h2>
            <p>Para dúvidas, solicitações ou reclamações relacionadas à privacidade:<br />
            <strong>E-mail:</strong> privacidade@oficinaPro.com.br<br />
            Você também pode registrar reclamações junto à <strong>ANPD</strong> (Autoridade Nacional de Proteção de Dados): <a href="https://www.gov.br/anpd" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">www.gov.br/anpd</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
