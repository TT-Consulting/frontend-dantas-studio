import { Settings, ArrowLeft } from 'lucide-react';
import { logo } from "../../constants/images";

export function MaintenanceScreen({ onBack }) {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-between p-6 relative overflow-hidden">
      {/* Background decorativo sutil */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      {/* Botão de Voltar */}
      <div className="max-w-md mx-auto w-full text-left">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Voltar para o início
        </button>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-md mx-auto w-full text-center flex flex-col items-center justify-center flex-1 py-12">
        {/* Logo da Marca */}
        {logo && (
          <img 
            src={logo} 
            alt="Logo Studio Annika" 
            className="h-20 w-auto object-contain mb-8 drop-shadow-[0_2px_8px_rgba(255,255,255,0.1)]" 
          />
        )}

        {/* Engrenagem Animada */}
        <div className="relative mb-6 text-accent p-4 bg-card rounded-full shadow-sm border border-border">
          <Settings size={48} className="animate-spin [animation-duration:8s]" />
          <Settings size={20} className="absolute bottom-2 right-2 text-primary animate-spin [animation-duration:4s] [animation-direction:reverse]" />
        </div>

        {/* Textos */}
        <h2 className="text-foreground text-2xl font-serif mb-3 tracking-wide">
          Área em Desenvolvimento
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
          Estamos preparando um espaço digital incrível e personalizado para você. Esta funcionalidade estará disponível em breve!
        </p>
      </div>

      {/* Footer da tela */}
      <div className="max-w-md mx-auto w-full text-center">
        <p className="text-muted-foreground/40 text-xs">
          © 2026 Studio Annika. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}