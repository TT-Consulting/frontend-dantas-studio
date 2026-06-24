import { Calendar, MapPin, Star, Clock, Instagram, Phone, Mail, Menu, User, LogIn, X, ChevronLeft, ChevronRight, Home, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

// Importando as imagens e incluindo o logo conforme apontado na image_53c399.png
import { CAROUSEL_IMAGES, GALLERY_IMAGES, SERVICE_IMAGES, logo } from '../../constants/images';

export function LandingPage({ onBookNow, onAdminLogin, onClientLogin }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentLocationSlide, setCurrentLocationSlide] = useState(0);

  // Hook para alterar dinamicamente o ícone da guia do browser (Favicon)
  useEffect(() => {
    if (logo) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = logo;
    }
  }, []);

  // Velocidade reduzida: alterado de 4000ms para 6000ms (6 segundos) para maior destaque das imagens
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === CAROUSEL_IMAGES.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === CAROUSEL_IMAGES.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? CAROUSEL_IMAGES.length - 1 : prev - 1));
  };

  // Mensagem do WhatsApp pré-definida e profissional
  const whatsappNumber = "5511945893227";
  const whatsappMessage = encodeURIComponent("Olá, Annika! Gostaria de consultar os horários disponíveis e saber mais sobre seus atendimentos.");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const services = [
    { id: '1', name: 'Manicure', description: 'Cuidado clássico para as unhas com esmaltação', price: 'R$ 50', duration: '45 min', image: SERVICE_IMAGES.manicure },
    { id: '2', name: 'Pedicure', description: 'Tratamento relaxante para os pés', price: 'R$ 60', duration: '60 min', image: SERVICE_IMAGES.pedicure },
    { id: '3', name: 'Unhas de Gel', description: 'Manicure em gel de longa durabilidade', price: 'R$ 120', duration: '90 min', image: SERVICE_IMAGES.gel },
    { id: '4', name: 'Nail Art Design', description: 'Desenhos artísticos e personalizados', price: 'R$ 150', duration: '120 min', image: SERVICE_IMAGES.art },
    { id: '5', name: 'Unhas de Acrílico', description: 'Alongamento profissional', price: 'R$ 180', duration: '120 min', image: SERVICE_IMAGES.acrylic },
  ];

  const testimonials = [
    { name: 'Maria Silva', rating: 5, text: 'Absolutamente incrível! A Annika é super talentosa e profissional.' },
    { name: 'Julia Santos', rating: 5, text: 'Melhor nail designer da cidade. Sempre saio me sentindo linda!' },
    { name: 'Beatriz Lima', rating: 5, text: 'A atenção aos detalhes é perfeita. Recomendo de olhos fechados!' },
  ];

  const galleryLinks = [
    'https://www.instagram.com/by.annikadantas/p/DYFl1WAEcei/',
    'https://www.instagram.com/by.annikadantas/p/DYYSvvPx950/',
    'https://www.instagram.com/by.annikadantas/p/DYHiCS0kTAQ/',
    'https://www.instagram.com/by.annikadantas/p/DYFkAxXkSoe/',
    'https://www.instagram.com/by.annikadantas/p/DYFj2wREWSz/',
    'https://www.instagram.com/by.annikadantas/p/DYYShUpxjrJ/',
    'https://www.instagram.com/by.annikadantas/p/DYYSO5LxiXH/',
    'https://www.instagram.com/by.annikadantas/p/DYYSE6QR8s-/'
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-background/90 backdrop-blur-md z-40 px-5 py-2 flex justify-between items-center border-b border-border shadow-md">
        <div className="flex items-center gap-4">
          <img 
            src={logo} 
            alt="Logo Studio Annika" 
            className="h-14 sm:h-16 w-auto object-contain drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)] transition-all" 
          />
          <h1 className="text-primary text-xl tracking-wide font-medium hidden sm:block">Studio Annika</h1>
        </div>
        <button 
          onClick={() => setMenuOpen(true)}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <Menu className="text-primary" size={24} />
        </button>
      </header>

      {/* Hamburger Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMenuOpen(false)}></div>
          <div className="absolute top-0 right-0 bottom-0 w-80 bg-card border-l border-border shadow-2xl">
            <div className="p-5">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <img src={logo} alt="Logo" className="h-10 w-auto object-contain drop-shadow-[0_2px_4px_rgba(255,255,255,0.1)]" />
                  <h3 className="text-primary text-lg">Menu</h3>
                </div>
                <button onClick={() => setMenuOpen(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <X className="text-muted-foreground" size={24} />
                </button>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => { setMenuOpen(false); onClientLogin?.(); }}
                  className="w-full bg-accent text-accent-foreground py-4 px-5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"><User size={20} /></div>
                  <div className="text-left flex-1">
                    <p className="font-medium">Área do Cliente</p>
                    <p className="text-xs text-white/80">Acompanhe seus agendamentos</p>
                  </div>
                </button>

                <button
                  onClick={() => { setMenuOpen(false); onAdminLogin(); }}
                  className="w-full bg-primary/10 text-primary py-4 px-5 rounded-xl hover:bg-primary/20 transition-all flex items-center gap-3 border border-primary/20"
                >
                  <div className="w-10 h-10 bg-primary/15 rounded-full flex items-center justify-center"><LogIn size={20} /></div>
                  <div className="text-left flex-1">
                    <p className="font-medium">Área da Profissional</p>
                    <p className="text-xs text-primary/70">Acesso administrativo</p>
                  </div>
                </button>
              </div>

              <div className="mt-8 pt-8 border-t border-border">
                <p className="text-muted-foreground text-sm mb-4">Navegação Rápida</p>
                <div className="space-y-2">
                  <a href="#services" onClick={() => setMenuOpen(false)} className="block text-foreground/80 py-2 hover:text-primary transition-colors">Nossos Serviços</a>
                  <a href="#gallery" onClick={() => setMenuOpen(false)} className="block text-foreground/80 py-2 hover:text-primary transition-colors">Galeria</a>
                  <a href="#testimonials" onClick={() => setMenuOpen(false)} className="block text-foreground/80 py-2 hover:text-primary transition-colors">Depoimentos</a>
                  <a href="#location" onClick={() => setMenuOpen(false)} className="block text-foreground/80 py-2 hover:text-primary transition-colors">Localização</a>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-border">
                <p className="text-muted-foreground text-sm mb-4">Siga-nos</p>
                <div className="flex gap-3">
                  <a href="https://www.instagram.com/by.annikadantas" target="_blank" rel="noreferrer" className="w-10 h-10 bg-background border border-border rounded-full flex items-center justify-center hover:bg-accent hover:text-white transition-colors"><Instagram size={18} /></a>
                  <a href={whatsappUrl} target="_blank" rel="noreferrer" className="w-10 h-10 bg-background border border-border rounded-full flex items-center justify-center hover:bg-accent hover:text-white transition-colors"><Phone size={18} /></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-20">
        <div className="relative h-[450px] w-full overflow-hidden shadow-inner">
          {CAROUSEL_IMAGES.map((imgUrl, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <img
                src={imgUrl}
                alt={`Trabalho Studio Annika ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}

          {/* Filtro escuro diminuído (de bg-black/40 para bg-black/15) para destacar as imagens */}
          <div className="absolute inset-0 bg-black/15 z-20 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-20 pointer-events-none" />

          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all shadow-md backdrop-blur-sm border border-white/10"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all shadow-md backdrop-blur-sm border border-white/10"
          >
            <ChevronRight size={24} />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {CAROUSEL_IMAGES.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentSlide ? 'bg-accent w-6' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="px-5 pt-8 pb-12 text-center max-w-xl mx-auto">
          <h2 className="text-foreground text-3xl font-serif leading-tight mb-3">
            Sua beleza,
            <br />
            <span className="text-accent font-sans font-medium text-4xl">no seu tempo</span>
          </h2>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            Atendimento personalizado e unhas impecáveis com acabamento de alta durabilidade.
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section className="px-5 py-16 bg-card border-y border-border" id="services">
        <div className="text-center mb-10">
          <h3 className="text-primary text-2xl mb-2 font-medium">Nossos Serviços</h3>
          <p className="text-muted-foreground text-sm">Tratamentos premium para o cuidado das suas unhas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto">
          {services.map((service) => (
            <div
              key={service.id}
              /* Adicionado efeito hover/active com aumento suave (scale) e sombra elegante */
              className="bg-background rounded-xl p-5 shadow-sm border border-border hover:border-primary/30 transition-all duration-300 flex gap-4 items-start group hover:scale-[1.03] active:scale-[1.01] hover:shadow-md cursor-pointer"
            >
              <div className="w-16 h-16 bg-card rounded-lg overflow-hidden flex-shrink-0 border border-border">
                <img src={service.image} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div className="flex-1">
                <h4 className="text-foreground font-medium mb-1">{service.name}</h4>
                <p className="text-muted-foreground text-xs mb-3">{service.description}</p>
                <div className="flex justify-between items-center">
                  <p className="text-accent font-medium text-lg">{service.price}</p>
                  <div className="flex items-center gap-1 text-muted-foreground text-xs">
                    <Clock size={14} />
                    <span>{service.duration}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery Section */}
      <section className="px-5 py-16" id="gallery">
        <div className="text-center mb-10">
          <h3 className="text-primary text-2xl mb-2 font-medium">Galeria de Trabalhos</h3>
          <p className="text-muted-foreground text-sm">Acompanhe as últimas criações direto do estúdio</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
          {GALLERY_IMAGES.slice(0, 8).map((imgUrl, i) => (
            <a
              key={i}
              href={galleryLinks[i] || "https://www.instagram.com/by.annikadantas"}
              target="_blank"
              rel="noreferrer"
              className="aspect-square rounded-xl shadow-md overflow-hidden border border-border group relative bg-card block"
            >
              <img src={imgUrl} alt={`Trabalho do portfólio ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <Instagram className="text-white drop-shadow-md" size={24} />
              </div>
            </a>
          ))}
        </div>

        <div className="text-center mt-8">
          <a
            href="https://www.instagram.com/by.annikadantas"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors font-medium text-sm"
          >
            <Instagram size={18} />
            <span>Siga-nos @by.annikadantas</span>
          </a>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-5 py-16 bg-card border-y border-border" id="testimonials">
        <div className="text-center mb-10">
          <h3 className="text-primary text-2xl mb-2 font-medium">O Que Dizem Nossos Clientes</h3>
          <p className="text-muted-foreground text-sm">Avaliações reais de quem frequenta nosso espaço</p>
        </div>

        <div className="space-y-4 max-w-2xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-background rounded-xl p-5 shadow-sm border border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                  <span className="text-primary font-medium text-sm">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-foreground text-sm font-medium">{testimonial.name}</p>
                  <div className="flex gap-0.5">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} size={12} className="fill-accent text-accent" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground text-sm italic">"{testimonial.text}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* Location Section - Implementado Carrossel de Cards */}
      <section className="px-5 py-16" id="location">
        <div className="text-center mb-10">
          <h3 className="text-primary text-2xl mb-2 font-medium">Como Atendemos</h3>
          <p className="text-muted-foreground text-sm">Escolha a melhor opção para você</p>
        </div>

        <div className="max-w-md mx-auto relative group/nav">
          <div className="overflow-hidden relative rounded-xl">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentLocationSlide * 100}%)` }}
            >
              {/* CARD 1: Atendimento Presencial */}
              <div className="w-full flex-shrink-0 p-1">
                <div className="bg-card rounded-xl p-6 shadow-md border border-border min-h-[360px] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-4 text-primary font-medium tracking-wide uppercase text-xs">
                      <MapPin size={16} className="text-accent" />
                      <span>Atendimento no Estúdio</span>
                    </div>
                    <div className="flex items-start gap-3 mb-4">
                      <div>
                        <p className="text-foreground font-medium text-sm mb-0.5">Edifício Comercial</p>
                        <p className="text-muted-foreground text-sm">Av. Rebouças, 2469 - Pinheiros</p>
                        <p className="text-muted-foreground/60 text-xs">São Paulo - SP, 05401-350</p>
                      </div>
                    </div>

                    <div className="bg-background rounded-lg p-4 border border-border mb-4">
                      <p className="text-primary font-medium text-[11px] mb-2 tracking-wide uppercase">Horário de Funcionamento</p>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex justify-between"><span>Segunda a Sexta:</span> <span className="font-medium text-foreground">9h - 19h</span></div>
                        <div className="flex justify-between"><span>Sábado:</span> <span className="font-medium text-foreground">9h - 17h</span></div>
                        <div className="flex justify-between"><span>Domingo:</span> <span className="text-red-400 font-medium">Fechado</span></div>
                      </div>
                    </div>
                  </div>

                  <a 
                    href="https://maps.app.goo.gl/41NRN8qHm58SDExQA" 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full bg-primary/10 hover:bg-primary/20 text-primary text-center font-medium py-3 rounded-xl block border border-primary/20 transition-all text-sm"
                  >
                    Ver no Google Maps
                  </a>
                </div>
              </div>

              {/* CARD 2: Atendimento a Domicílio */}
              <div className="w-full flex-shrink-0 p-1">
                <div className="bg-card rounded-xl p-6 shadow-md border border-border min-h-[360px] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-4 text-primary font-medium tracking-wide uppercase text-xs">
                      <Home size={16} className="text-accent" />
                      <span>Atendimento VIP a Domicílio</span>
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                      Leve a experiência completa do estúdio para o conforto da sua casa. Atendimento exclusivo com materiais 100% esterilizados.
                    </p>

                    <div className="space-y-3 bg-background rounded-lg p-4 border border-border mb-4">
                      <div>
                        <p className="text-foreground font-medium text-xs uppercase tracking-wide text-primary mb-0.5">Regiões Atendidas</p>
                        <p className="text-muted-foreground text-xs">Principais bairros da <strong>Zona Sul</strong> e <strong>Zona Oeste</strong>.</p>
                      </div>
                      <div className="border-t border-border/60 pt-2">
                        <p className="text-foreground font-medium text-xs uppercase tracking-wide text-primary mb-0.5">Taxa de Deslocamento</p>
                        <p className="text-muted-foreground text-xs">Calculada de acordo com o seu endereço completo.</p>
                      </div>
                    </div>
                  </div>

                  <a 
                    href={whatsappUrl}
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full bg-accent text-white text-center font-medium py-3 rounded-xl block shadow-md hover:bg-accent/90 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <span>Informar meu Endereço</span>
                    <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Setas de navegação do carrossel */}
          <button 
            onClick={() => setCurrentLocationSlide(0)}
            className={`absolute left-[-15px] top-1/2 -translate-y-1/2 p-1.5 rounded-full border border-border bg-background shadow-md transition-all z-10 ${currentLocationSlide === 0 ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={() => setCurrentLocationSlide(1)}
            className={`absolute right-[-15px] top-1/2 -translate-y-1/2 p-1.5 rounded-full border border-border bg-background shadow-md transition-all z-10 ${currentLocationSlide === 1 ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}
          >
            <ChevronRight size={18} />
          </button>

          {/* Indicadores de bolinha */}
          <div className="flex justify-center gap-1.5 mt-4">
            <button onClick={() => setCurrentLocationSlide(0)} className={`w-2 h-2 rounded-full transition-all ${currentLocationSlide === 0 ? 'bg-accent w-4' : 'bg-border'}`} />
            <button onClick={() => setCurrentLocationSlide(1)} className={`w-2 h-2 rounded-full transition-all ${currentLocationSlide === 1 ? 'bg-accent w-4' : 'bg-border'}`} />
          </div>
        </div>
      </section>

      

      {/* CTA Section */}
      <section className="px-5 py-16 bg-gradient-to-b from-card to-background text-center border-t border-border">
        <h3 className="text-2xl mb-3 font-medium text-foreground">Pronta para Transformar suas Unhas?</h3>
        <p className="mb-8 text-muted-foreground text-sm max-w-md mx-auto">
          Agende agora e garanta seu horário com a melhor estrutura e profissionais da região.
        </p>
        <button
          onClick={onBookNow}
          className="bg-accent text-white font-medium px-10 py-4 rounded-xl shadow-lg hover:bg-accent/90 hover:shadow-accent/20 transition-all"
        >
          Agendar Agora
        </button>
      </section>

      {/* Footer */}
      <footer className="px-5 py-12 bg-card border-t border-border">
        <div className="max-w-md mx-auto">
          <div className="flex justify-center gap-6 mb-6">
            <a href="https://www.instagram.com/by.annikadantas" target="_blank" rel="noreferrer" className="w-10 h-10 bg-background border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-accent transition-colors"><Instagram size={18} /></a>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="w-10 h-10 bg-background border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-accent transition-colors"><Phone size={18} /></a>
          </div>

          <div className="text-center pt-4 border-t border-border">
            <button onClick={onAdminLogin} className="text-muted-foreground text-xs hover:text-primary transition-colors">
              Área da Profissional
            </button>
          </div>

          <div className="text-center mt-4">
            <p className="text-muted-foreground/50 text-xs">© 2026 Studio Annika. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Botão Flutuante */}
      <div className="fixed bottom-6 left-0 right-0 px-5 z-30 pointer-events-none">
        <button
          onClick={onBookNow}
          className="w-full max-w-xs mx-auto bg-accent text-white py-4 rounded-xl shadow-xl hover:shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 pointer-events-auto"
        >
          <Calendar size={18} />
          <span className="text-sm font-medium tracking-wider">AGENDAR AGORA</span>
        </button>
      </div>
    </div>
  );
}