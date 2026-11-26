import { useState } from 'react';
import loginImage from '../../assets/PNG/galery/nail_galery_1.png';
import signupImage from '../../assets/PNG/services/nail_hand_service_3.png';

/* ------------------------------------------------------------------ */
/*  Ícones                                                             */
/* ------------------------------------------------------------------ */
const Icon = ({ children }) => (
  <svg
    className="w-[18px] h-[18px]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

const IconMail = () => (
  <Icon>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </Icon>
);
const IconUser = () => (
  <Icon>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </Icon>
);
const IconPhone = () => (
  <Icon>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
  </Icon>
);

/* ------------------------------------------------------------------ */
/*  Gotas de esmalte (mobile)                                          */
/* ------------------------------------------------------------------ */
// Cada gota tem uma posição no login e outra no cadastro [x, y, rotação]
const DROPS = [
  { size: 84,  tone: 'text-white',     o: 0.22, login: ['6%', '16%', -14],  signup: ['62%', '10%', 18] },
  { size: 52,  tone: 'text-[#FCD3DE]', o: 0.55, login: ['72%', '10%', 12],  signup: ['10%', '34%', -20] },
  { size: 120, tone: 'text-[#F7A4BA]', o: 0.45, login: ['56%', '40%', -8],  signup: ['-8%', '-8%', 10] },
  { size: 36,  tone: 'text-white',     o: 0.35, login: ['34%', '6%', 20],   signup: ['44%', '48%', -10] },
  { size: 64,  tone: 'text-[#FCD3DE]', o: 0.4,  login: ['12%', '52%', 8],   signup: ['78%', '44%', -16] },
  { size: 28,  tone: 'text-white',     o: 0.4,  login: ['88%', '36%', -6],  signup: ['28%', '2%', 14] },
  { size: 44,  tone: 'text-[#F7A4BA]', o: 0.55, login: ['38%', '58%', 18],  signup: ['88%', '6%', -4] },
];

function PolishDrop({ size, fillOpacity }) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 40 52" fill="none">
      <path
        d="M20 2C20 2 5 21 5 34a15 15 0 0 0 30 0C35 21 20 2 20 2Z"
        fill="currentColor"
        fillOpacity={fillOpacity}
      />
      <ellipse
        cx="13.5"
        cy="33"
        rx="3"
        ry="6.5"
        transform="rotate(12 13.5 33)"
        fill="white"
        fillOpacity="0.55"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Campos                                                             */
/* ------------------------------------------------------------------ */
const desktopInput =
  'w-full px-4 py-3 bg-input-background text-foreground placeholder:text-muted-foreground ' +
  'rounded-xl border border-border ' +
  'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all';

// Mobile: campo só com linha embaixo. Desktop: campo dentro do card.
function TextField({ variant, label, icon, ...inputProps }) {
  if (variant === 'mobile') {
    return (
      <div>
        <label className="text-sm font-semibold text-foreground mb-1 block">{label}</label>
        <div className="flex items-center gap-3 border-b-2 border-border focus-within:border-primary transition-colors py-2">
          <span className="text-muted-foreground">{icon}</span>
          <span className="h-4 w-px bg-border" />
          <input
            {...inputProps}
            className="flex-1 min-w-0 bg-transparent outline-none text-base text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="text-sm text-muted-foreground mb-2 block">{label}</label>
      <input {...inputProps} className={desktopInput} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Estrutura dos formulários                                          */
/* ------------------------------------------------------------------ */
function MobileShell({ title, subtitle, onSubmit, error, submitLabel, toggleText, toggleLabel, onToggle, children }) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col h-full">
      <h1 className="text-3xl font-bold text-foreground">
        <span className="underline decoration-accent decoration-2 underline-offset-8">{title}</span>
      </h1>
      <p className="text-sm text-muted-foreground mt-4 mb-8">{subtitle}</p>

      <div className="space-y-5">{children}</div>

      {error && (
        <p role="alert" className="mt-5 p-3 text-sm rounded-xl bg-destructive/10 border border-destructive/30 text-destructive">
          {error}
        </p>
      )}

      <div className="mt-auto pt-8">
        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-gradient-to-br from-accent to-primary text-accent-foreground font-semibold shadow-lg shadow-accent/30 active:scale-[0.99] transition"
        >
          {submitLabel}
        </button>
        <p className="text-center text-sm text-foreground mt-5">
          {toggleText}
          <button type="button" onClick={onToggle} className="text-accent font-semibold ml-1">
            {toggleLabel}
          </button>
        </p>
      </div>
    </form>
  );
}

function DesktopShell({ title, subtitle, onSubmit, error, submitLabel, toggleText, toggleLabel, onToggle, children }) {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground">
          {title}
          <span className="text-primary">.</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {children}

        {error && (
          <p role="alert" className="p-3 text-sm rounded-xl bg-destructive/10 border border-destructive/30 text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full py-3.5 mt-2 rounded-xl text-accent-foreground bg-gradient-to-br from-accent to-primary shadow-lg hover:shadow-xl hover:brightness-110 transition"
        >
          {submitLabel}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        {toggleText}
        <button type="button" onClick={onToggle} className="text-primary font-medium ml-2 hover:underline">
          {toggleLabel}
        </button>
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tela                                                               */
/* ------------------------------------------------------------------ */
export function ClientAuthScreen({
  showRegister,
  onShowRegisterChange,
  onBack,
  loginError,
  onIdentifierChange,
  onLogin,
  registerData,
  onRegisterChange,
  onRegister,
}) {
  const isLogin = !showRegister;
  const [identifier, setIdentifier] = useState('');

  const handleIdentifier = (e) => {
    setIdentifier(e.target.value);
    if (onIdentifierChange) onIdentifierChange(e.target.value);
  };

  const toggle = () => onShowRegisterChange(isLogin);
  const handleBack = () => (isLogin ? onBack && onBack() : onShowRegisterChange(false));

  const BackIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );

  const renderForm = (variant, mode) => {
    const Shell = variant === 'mobile' ? MobileShell : DesktopShell;

    if (mode === 'login') {
      return (
        <Shell
          title="Área do cliente"
          subtitle="Insira seus dados para acessar"
          onSubmit={onLogin}
          error={loginError}
          submitLabel="Acessar portal"
          toggleText="Primeira vez por aqui?"
          toggleLabel="Cadastro rápido"
          onToggle={toggle}
        >
          <TextField
            variant={variant}
            label="WhatsApp ou e-mail"
            icon={<IconMail />}
            type="text"
            value={identifier}
            onChange={handleIdentifier}
            placeholder="Seu e-mail ou WhatsApp cadastrado"
            autoComplete="username"
            required
          />
        </Shell>
      );
    }

    return (
      <Shell
        title="Cadastro rápido"
        subtitle="Crie sua conta para começar"
        onSubmit={onRegister}
        submitLabel="Criar conta"
        toggleText="Já tem uma conta?"
        toggleLabel="Entrar"
        onToggle={toggle}
      >
        <TextField
          variant={variant}
          label="Nome completo"
          icon={<IconUser />}
          type="text"
          value={registerData.name}
          onChange={(e) => onRegisterChange('name', e.target.value)}
          placeholder="Seu nome completo"
          autoComplete="name"
          required
        />
        <TextField
          variant={variant}
          label="E-mail"
          icon={<IconMail />}
          type="email"
          value={registerData.email}
          onChange={(e) => onRegisterChange('email', e.target.value)}
          placeholder="seu@email.com"
          autoComplete="email"
          required
        />
        <TextField
          variant={variant}
          label="WhatsApp"
          icon={<IconPhone />}
          type="tel"
          value={registerData.phone}
          onChange={(e) => onRegisterChange('phone', e.target.value)}
          placeholder="(11) 98765-4321"
          autoComplete="tel"
          required
        />
      </Shell>
    );
  };

  const slide =
    'col-start-1 row-start-1 transition-[opacity,transform,visibility] duration-500 ease-in-out';

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* ===================== MOBILE (dark) ===================== */}
      <div className="md:hidden dark min-h-[100dvh] flex flex-col bg-background text-foreground overflow-x-hidden">
        <style>{`
          @keyframes polish-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-9px); }
          }
          .polish-float { animation: polish-float 5s ease-in-out infinite; }
          @media (prefers-reduced-motion: reduce) { .polish-float { animation: none; } }
        `}</style>

        {/* Topo com as gotas de esmalte */}
        <div
          className={`relative shrink-0 min-h-[170px] overflow-hidden bg-gradient-to-br from-accent to-primary transition-[height] duration-700 ease-in-out ${
            isLogin ? 'h-[40dvh]' : 'h-[28dvh]'
          }`}
        >
          {DROPS.map((d, i) => {
            const [x, y, r] = isLogin ? d.login : d.signup;
            return (
              <div
                key={i}
                className={`absolute ${d.tone}`}
                style={{
                  left: x,
                  top: y,
                  transform: `rotate(${r}deg)`,
                  transition:
                    'left 0.9s cubic-bezier(.65,0,.35,1), top 0.9s cubic-bezier(.65,0,.35,1), transform 0.9s cubic-bezier(.65,0,.35,1)',
                  transitionDelay: `${i * 50}ms`,
                }}
              >
                <div
                  className="polish-float"
                  style={{ animationDelay: `${i * -0.7}s`, animationDuration: `${4 + (i % 3)}s` }}
                >
                  <PolishDrop size={d.size} fillOpacity={d.o} />
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={handleBack}
            aria-label="Voltar"
            className="absolute left-4 top-4 z-20 w-9 h-9 bg-white/20 backdrop-blur-sm flex items-center justify-center rounded-full"
          >
            {BackIcon}
          </button>

          {/* Onda: desliza e inverte a curva ao trocar de login para cadastro */}
          <svg
            viewBox="0 0 1800 100"
            preserveAspectRatio="none"
            className="absolute left-0 -bottom-px h-24 w-[300%] transition-transform duration-700 ease-in-out"
            style={{
              fill: 'var(--background)',
              transform: `translateX(${isLogin ? 0 : -16.6667}%)`,
            }}
          >
            <path d="M0 50Q150 -30 300 50T600 50T900 50T1200 50T1500 50T1800 50V100H0Z" />
          </svg>
        </div>

        {/* Formulários: um sai deslizando enquanto o outro entra */}
        <div className="relative z-10 flex-1 grid px-6 pt-2 pb-8">
          <div
            className={`${slide} ${
              isLogin ? 'opacity-100 translate-x-0 visible' : 'opacity-0 -translate-x-8 invisible'
            }`}
          >
            {renderForm('mobile', 'login')}
          </div>
          <div
            className={`${slide} ${
              isLogin ? 'opacity-0 translate-x-8 invisible' : 'opacity-100 translate-x-0 visible'
            }`}
          >
            {renderForm('mobile', 'register')}
          </div>
        </div>
      </div>

      {/* ===================== DESKTOP (dark) ===================== */}
      <div className="hidden md:block dark bg-background text-foreground relative min-h-screen overflow-hidden">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Voltar"
          className="absolute left-6 top-6 z-20 w-10 h-10 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors flex items-center justify-center rounded-full"
        >
          {BackIcon}
        </button>

        {/* Painel da imagem: direita no login, esquerda no cadastro */}
        <div
          className={`absolute inset-y-0 left-0 w-1/2 transition-transform duration-700 ease-in-out ${
            isLogin ? 'translate-x-full' : 'translate-x-0'
          }`}
        >
          <div
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${
              isLogin ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url(${loginImage})` }}
          />
          <div
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${
              isLogin ? 'opacity-0' : 'opacity-100'
            }`}
            style={{ backgroundImage: `url(${signupImage})` }}
          />
          <div
            className={`absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent transition-opacity duration-700 ${
              isLogin ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <div
            className={`absolute inset-0 bg-gradient-to-l from-background via-background/50 to-transparent transition-opacity duration-700 ${
              isLogin ? 'opacity-0' : 'opacity-100'
            }`}
          />
        </div>

        {/* Painel do formulário: esquerda no login, direita no cadastro */}
        <div
          className={`absolute inset-y-0 left-0 w-1/2 flex items-center justify-center p-8 transition-transform duration-700 ease-in-out ${
            isLogin ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-10 shadow-2xl shadow-black/40">
            <div className="grid">
              <div
                className={`col-start-1 row-start-1 self-center transition-[opacity,visibility] duration-500 ${
                  isLogin ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
              >
                {renderForm('desktop', 'login')}
              </div>
              <div
                className={`col-start-1 row-start-1 self-center transition-[opacity,visibility] duration-500 ${
                  isLogin ? 'opacity-0 invisible' : 'opacity-100 visible'
                }`}
              >
                {renderForm('desktop', 'register')}
              </div>
            </div>
          </div>
        </div>

        <p className="absolute bottom-5 left-0 right-0 text-center text-sm text-muted-foreground z-10">
          2026 | Dantas Studio
        </p>
      </div>
    </div>
  );
}