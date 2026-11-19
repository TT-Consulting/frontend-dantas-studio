import { useState } from 'react';
import { realizarLogin, registrarUsuario } from '../../api';
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
const IconLock = () => (
  <Icon>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
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
const IconEye = () => (
  <Icon>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);
const IconEyeOff = () => (
  <Icon>
    <path d="M10.6 5.1A9.7 9.7 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7c1.7 0 3.2-.4 4.5-1" />
    <path d="M3 3l18 18" />
  </Icon>
);

/* ------------------------------------------------------------------ */
/*  MOBILE: gotas de esmalte + onda                                    */
/* ------------------------------------------------------------------ */

const DROPS = [
  { size: 84,  tone: 'text-white',      o: 0.22, login: ['6%', '16%', -14],  signup: ['62%', '10%', 18] },
  { size: 52,  tone: 'text-[#FCD3DE]',  o: 0.55, login: ['72%', '10%', 12],  signup: ['10%', '34%', -20] },
  { size: 120, tone: 'text-[#F7A4BA]',  o: 0.45, login: ['56%', '40%', -8],  signup: ['-8%', '-8%', 10] },
  { size: 36,  tone: 'text-white',      o: 0.35, login: ['34%', '6%', 20],   signup: ['44%', '48%', -10] },
  { size: 64,  tone: 'text-[#FCD3DE]',  o: 0.4,  login: ['12%', '52%', 8],   signup: ['78%', '44%', -16] },
  { size: 28,  tone: 'text-white',      o: 0.4,  login: ['88%', '36%', -6],  signup: ['28%', '2%', 14] },
  { size: 44,  tone: 'text-[#F7A4BA]',  o: 0.55, login: ['38%', '58%', 18],  signup: ['88%', '6%', -4] },
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

function UnderlineField({ label, icon, type = 'text', value, onChange, placeholder, autoComplete }) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  return (
    <div>
      <label className="text-sm font-semibold text-foreground mb-1 block">{label}</label>
      <div className="flex items-center gap-3 border-b-2 border-border focus-within:border-primary transition-colors py-2">
        <span className="text-muted-foreground">{icon}</span>
        <span className="h-4 w-px bg-border" />
        <input
          type={isPassword && show ? 'text' : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="flex-1 min-w-0 bg-transparent outline-none text-base text-foreground placeholder:text-muted-foreground"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            {show ? <IconEyeOff /> : <IconEye />}
          </button>
        )}
      </div>
    </div>
  );
}

function MobileForm({ mode, form, set, error, success, loading, onSubmit, onToggle }) {
  const isLogin = mode === 'login';

  return (
    <form onSubmit={onSubmit} className="flex flex-col h-full">
      <h1 className="text-4xl font-bold text-foreground mb-8">
        <span className="underline decoration-accent decoration-2 underline-offset-8">
          {isLogin ? 'Entrar' : 'Cadastrar'}
        </span>
      </h1>

      <div className="space-y-5">
        {!isLogin && (
          <UnderlineField
            label="Nome completo"
            icon={<IconUser />}
            value={form.name}
            onChange={set('name')}
            placeholder="Seu nome"
            autoComplete="name"
          />
        )}

        <UnderlineField
          label="E-mail"
          icon={<IconMail />}
          type="email"
          value={form.email}
          onChange={set('email')}
          placeholder="seu@email.com"
          autoComplete="email"
        />

        {!isLogin && (
          <UnderlineField
            label="Telefone / WhatsApp"
            icon={<IconPhone />}
            type="tel"
            value={form.phone}
            onChange={set('phone')}
            placeholder="(11) 99999-9999"
            autoComplete="tel"
          />
        )}

        <UnderlineField
          label="Senha"
          icon={<IconLock />}
          type="password"
          value={form.password}
          onChange={set('password')}
          placeholder="insira sua senha"
          autoComplete={isLogin ? 'current-password' : 'new-password'}
        />

        {!isLogin && (
          <UnderlineField
            label="Confirmar senha"
            icon={<IconLock />}
            type="password"
            value={form.confirm}
            onChange={set('confirm')}
            placeholder="repita sua senha"
            autoComplete="new-password"
          />
        )}
      </div>

      {isLogin && (
        <div className="flex items-center justify-between mt-5">
          <label className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <input type="checkbox" className="w-4 h-4 rounded accent-[var(--accent)]" />
            Permanecer conectado
          </label>
          <button type="button" className="text-xs font-semibold text-accent">
            Esqueci minha senha
          </button>
        </div>
      )}

      {error && <p className="text-sm text-destructive mt-4">{error}</p>}
      {success && <p className="text-sm text-emerald-500 mt-4">{success}</p>}

      <div className="mt-auto pt-8">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-br from-accent to-primary text-accent-foreground font-semibold shadow-lg shadow-accent/30 active:scale-[0.99] transition disabled:opacity-50"
        >
          {loading ? 'Processando...' : isLogin ? 'Entrar' : 'Criar conta'}
        </button>

        <p className="text-center text-sm text-foreground mt-5">
          {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
          <button type="button" onClick={onToggle} className="text-accent font-semibold ml-1">
            {isLogin ? 'Cadastre-se' : 'Entrar'}
          </button>
        </p>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  DESKTOP: formulário dentro do card                                 */
/* ------------------------------------------------------------------ */
const inputClass =
  'w-full px-4 py-3 bg-input-background text-foreground placeholder:text-muted-foreground ' +
  'rounded-xl border border-border ' +
  'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all';

const labelClass = 'text-sm text-muted-foreground mb-2 block';

function Field({ label, children }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

function AuthForm({ mode, form, set, error, success, loading, onSubmit, onToggle }) {
  const isLogin = mode === 'login';

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground">
          {isLogin ? 'Faça seu login' : 'Crie sua conta'}
          <span className="text-primary">.</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          {isLogin
            ? 'Insira suas credenciais para entrar'
            : 'Preencha os dados abaixo para se cadastrar'}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {!isLogin && (
          <Field label="Nome completo">
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              placeholder="Seu nome"
              className={inputClass}
            />
          </Field>
        )}

        <Field label="E-mail">
          <input
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="seu@email.com"
            className={inputClass}
          />
        </Field>

        {!isLogin && (
          <Field label="Telefone / WhatsApp">
            <input
              type="tel"
              value={form.phone}
              onChange={set('phone')}
              placeholder="(11) 99999-9999"
              className={inputClass}
            />
          </Field>
        )}

        <Field label="Senha">
          <input
            type="password"
            value={form.password}
            onChange={set('password')}
            placeholder="insira sua senha"
            className={inputClass}
          />
        </Field>

        {!isLogin && (
          <Field label="Confirmar senha">
            <input
              type="password"
              value={form.confirm}
              onChange={set('confirm')}
              placeholder="repita sua senha"
              className={inputClass}
            />
          </Field>
        )}

        {isLogin && (
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" className="rounded accent-[var(--primary)]" />
              Permanecer conectado
            </label>
            <button type="button" className="text-sm text-primary hover:underline">
              Esqueci minha senha
            </button>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && <p className="text-sm text-emerald-500">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 mt-2 rounded-xl text-accent-foreground bg-gradient-to-br from-accent to-primary shadow-lg hover:shadow-xl hover:brightness-110 transition disabled:opacity-50"
        >
          {loading ? 'Processando...' : isLogin ? 'Entrar' : 'Criar conta'}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
        <button
          type="button"
          onClick={onToggle}
          className="text-primary font-medium ml-2 hover:underline"
        >
          {isLogin ? 'Criar conta' : 'Entrar'}
        </button>
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tela Principal                                                     */
/* ------------------------------------------------------------------ */
export function LoginScreen({ onLogin, onBack }) {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  });

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const toggle = () => {
    setError('');
    setSuccess('');
    setIsLogin((v) => !v);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isLogin && form.password !== form.confirm) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      setLoading(true);
      if (isLogin) {
        // Envia as credenciais reais para o backend Spring Boot
        const response = await realizarLogin({
          email: form.email,
          senha: form.password,
        });
        
        // Se houver token, guarda no localStorage
        if (response?.token) {
          localStorage.setItem('token', response.token);
        }

        onLogin(response);
      } else {
        // Cria novo usuário enviando o DTO correspondente ao backend
        await registrarUsuario({
          nomeCompleto: form.name,
          email: form.email,
          senha: form.password,
          tokenWhatsapp: form.phone,
          permissao: 'ADMIN',
          isAtivo: true,
        });

        setSuccess('Conta criada com sucesso! Faça seu login.');
        setIsLogin(true);
        setForm({ name: '', email: '', phone: '', password: '', confirm: '' });
      }
    } catch (err) {
      setError(
        err.response?.data?.mensagem || 
        err.response?.data?.message || 
        'Erro ao conectar com o servidor. Verifique suas credenciais.'
      );
    } finally {
      setLoading(false);
    }
  };

  const formProps = { form, set, error, success, loading, onSubmit: handleSubmit, onToggle: toggle };

  const BackIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );

  const slide =
    'col-start-1 row-start-1 transition-[opacity,transform,visibility] duration-500 ease-in-out';

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* ===================== MOBILE (tema claro) ===================== */}
      <div className="md:hidden dark min-h-[100dvh] flex flex-col bg-background text-foreground overflow-x-hidden">
        <style>{`
          @keyframes polish-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-9px); }
          }
          .polish-float { animation: polish-float 5s ease-in-out infinite; }
          @media (prefers-reduced-motion: reduce) { .polish-float { animation: none; } }
        `}</style>

        <div
          className={`relative shrink-0 min-h-[170px] overflow-hidden bg-gradient-to-br from-accent to-primary transition-[height] duration-700 ease-in-out ${
            isLogin ? 'h-[38dvh]' : 'h-[24dvh]'
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
                  transition: 'left 0.9s cubic-bezier(.65,0,.35,1), top 0.9s cubic-bezier(.65,0,.35,1), transform 0.9s cubic-bezier(.65,0,.35,1)',
                  transitionDelay: `${i * 50}ms`,
                }}
              >
                <div className="polish-float" style={{ animationDelay: `${i * -0.7}s`, animationDuration: `${4 + (i % 3)}s` }}>
                  <PolishDrop size={d.size} fillOpacity={d.o} />
                </div>
              </div>
            );
          })}

          <button
            onClick={() => onBack && onBack()}
            aria-label="Voltar"
            className="absolute left-4 top-4 z-20 w-9 h-9 bg-white/20 backdrop-blur-sm flex items-center justify-center rounded-full"
          >
            {BackIcon}
          </button>

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

        <div className="relative z-10 flex-1 grid px-6 pt-2 pb-8">
          <div
            className={`${slide} ${
              isLogin ? 'opacity-100 translate-x-0 visible' : 'opacity-0 -translate-x-8 invisible'
            }`}
          >
            <MobileForm mode="login" {...formProps} />
          </div>
          <div
            className={`${slide} ${
              isLogin ? 'opacity-0 translate-x-8 invisible' : 'opacity-100 translate-x-0 visible'
            }`}
          >
            <MobileForm mode="signup" {...formProps} />
          </div>
        </div>
      </div>

      {/* ===================== DESKTOP (tema escuro) ===================== */}
      <div className="hidden md:block dark bg-background text-foreground relative min-h-screen overflow-hidden">
        <button
          onClick={() => onBack && onBack()}
          aria-label="Voltar"
          className="absolute left-6 top-6 z-20 w-10 h-10 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors flex items-center justify-center rounded-full"
        >
          {BackIcon}
        </button>

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
                <AuthForm mode="login" {...formProps} />
              </div>
              <div
                className={`col-start-1 row-start-1 self-center transition-[opacity,visibility] duration-500 ${
                  isLogin ? 'opacity-0 invisible' : 'opacity-100 visible'
                }`}
              >
                <AuthForm mode="signup" {...formProps} />
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