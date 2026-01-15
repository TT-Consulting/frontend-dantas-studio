import { Calendar, MapPin, Star, Clock, Instagram, Phone, Mail, Menu, User, LogIn, X } from 'lucide-react';
import { useState } from 'react';

export function LandingPage({ onBookNow, onAdminLogin, onClientLogin }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const services = [
    {
      id: '1',
      name: 'Manicure',
      description: 'Classic nail care with polish',
      price: 'R$ 50',
      duration: '45 min',
      image: '💅',
    },
    {
      id: '2',
      name: 'Pedicure',
      description: 'Relaxing foot treatment',
      price: 'R$ 60',
      duration: '60 min',
      image: '🦶',
    },
    {
      id: '3',
      name: 'Gel Nails',
      description: 'Long-lasting gel manicure',
      price: 'R$ 120',
      duration: '90 min',
      image: '✨',
    },
    {
      id: '4',
      name: 'Nail Art Design',
      description: 'Custom artistic designs',
      price: 'R$ 150',
      duration: '120 min',
      image: '🎨',
    },
    {
      id: '5',
      name: 'Spa Manicure',
      description: 'Luxury spa experience',
      price: 'R$ 85',
      duration: '75 min',
      image: '🌸',
    },
    {
      id: '6',
      name: 'Acrylic Nails',
      description: 'Professional extensions',
      price: 'R$ 180',
      duration: '120 min',
      image: '💎',
    },
  ];

  const testimonials = [
    {
      name: 'Maria Silva',
      rating: 5,
      text: 'Absolutely amazing! Annika is so talented and professional.',
    },
    {
      name: 'Julia Santos',
      rating: 5,
      text: 'Best nail designer in town. I always leave feeling beautiful!',
    },
    {
      name: 'Beatriz Lima',
      rating: 5,
      text: 'The attention to detail is incredible. Highly recommend!',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm z-40 px-5 py-4 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-primary text-xl tracking-wide">Studio Annika</h1>
        </div>
        <button 
          onClick={() => setMenuOpen(true)}
          className="p-2 hover:bg-white rounded-lg transition-colors"
        >
          <Menu className="text-primary" size={24} />
        </button>
      </header>

      {/* Hamburger Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          ></div>
          <div className="absolute top-0 right-0 bottom-0 w-80 bg-white shadow-2xl">
            <div className="p-5">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-primary text-xl">Menu</h3>
                <button 
                  onClick={() => setMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="text-gray-600" size={24} />
                </button>
              </div>

              <div className="space-y-3">
                {/* Client Login */}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onClientLogin?.();
                  }}
                  className="w-full bg-accent text-white py-4 px-5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <User size={20} />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-medium">Área do Cliente</p>
                    <p className="text-xs text-white/80">Acompanhe seus agendamentos</p>
                  </div>
                </button>

                {/* Admin Login */}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onAdminLogin();
                  }}
                  className="w-full bg-primary/10 text-primary py-4 px-5 rounded-xl hover:bg-primary/20 transition-all flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <LogIn size={20} />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-medium">Área da Profissional</p>
                    <p className="text-xs text-primary/70">Acesso administrativo</p>
                  </div>
                </button>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-gray-600 text-sm mb-4">Navegação Rápida</p>
                <div className="space-y-2">
                  <a href="#services" className="block text-gray-700 py-2 hover:text-primary transition-colors">
                    Nossos Serviços
                  </a>
                  <a href="#gallery" className="block text-gray-700 py-2 hover:text-primary transition-colors">
                    Galeria
                  </a>
                  <a href="#testimonials" className="block text-gray-700 py-2 hover:text-primary transition-colors">
                    Depoimentos
                  </a>
                  <a href="#location" className="block text-gray-700 py-2 hover:text-primary transition-colors">
                    Localização
                  </a>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-gray-600 text-sm mb-4">Siga-nos</p>
                <div className="flex gap-3">
                  <a
                    href="#"
                    className="w-10 h-10 bg-background rounded-full flex items-center justify-center hover:bg-accent hover:text-white transition-colors"
                  >
                    <Instagram size={18} />
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-background rounded-full flex items-center justify-center hover:bg-accent hover:text-white transition-colors"
                  >
                    <Phone size={18} />
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-background rounded-full flex items-center justify-center hover:bg-accent hover:text-white transition-colors"
                  >
                    <Mail size={18} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative px-5 pt-24 pb-16 text-center">
        {/* Hero Image */}
        <div className="relative h-96 -mx-5 mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-200 via-pink-100 to-purple-100 flex items-center justify-center">
            <div className="text-center">
              <div className="text-8xl mb-4">💅</div>
              <p className="text-gray-600 text-sm">Professional Nail Care</p>
            </div>
          </div>
        </div>

        {/* Hero Text */}
        <div className="text-center mb-8">
          <h2 className="text-primary text-3xl leading-tight mb-2">
            Sua beleza,
            <br />
            no seu tempo
          </h2>
        </div>
      </section>

      {/* Services Section */}
      <section className="px-5 py-12 bg-white" id="services">
        <div className="text-center mb-8">
          <h3 className="text-primary text-2xl mb-2">Nossos Serviços</h3>
          <p className="text-gray-600">Choose from our premium treatments</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-background rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-3">{service.image}</div>
              <h4 className="text-primary mb-1">{service.name}</h4>
              <p className="text-gray-600 text-sm mb-3">{service.description}</p>
              <div className="flex justify-between items-center">
                <p className="text-accent text-lg">{service.price}</p>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <Clock size={14} />
                  <span>{service.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery Section */}
      <section className="px-5 py-12" id="gallery">
        <div className="text-center mb-8">
          <h3 className="text-primary text-2xl mb-2">Galeria de Trabalhos</h3>
          <p className="text-gray-600">See our latest creations</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl shadow-md flex items-center justify-center"
            >
              <span className="text-4xl">💅</span>
            </div>
          ))}
        </div>

        <div className="text-center mt-6">
          <a
            href="#"
            className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors"
          >
            <Instagram size={20} />
            <span>Follow us @studioannika</span>
          </a>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-5 py-12 bg-white" id="testimonials">
        <div className="text-center mb-8">
          <h3 className="text-primary text-2xl mb-2">O Que Dizem Nossos Clientes</h3>
          <p className="text-gray-600">Real reviews from real people</p>
        </div>

        <div className="space-y-4 max-w-2xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-background rounded-xl p-5 shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary text-lg">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-800">{testimonial.name}</p>
                  <div className="flex gap-0.5">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} size={14} className="fill-accent text-accent" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-sm italic">"{testimonial.text}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* Location Section */}
      <section className="px-5 py-12" id="location">
        <div className="text-center mb-8">
          <h3 className="text-primary text-2xl mb-2">Localização</h3>
          <p className="text-gray-600">Visit us at our studio</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md max-w-md mx-auto">
          <div className="flex items-start gap-3 mb-4">
            <MapPin className="text-accent flex-shrink-0 mt-1" size={20} />
            <div>
              <p className="text-gray-800 mb-1">Rua das Flores, 123</p>
              <p className="text-gray-600 text-sm">Jardins, São Paulo - SP</p>
              <p className="text-gray-600 text-sm">CEP: 01234-567</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <Phone className="text-accent flex-shrink-0" size={20} />
            <p className="text-gray-700">+55 11 98765-4321</p>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <Mail className="text-accent flex-shrink-0" size={20} />
            <p className="text-gray-700">contato@studioannika.com</p>
          </div>

          <div className="bg-gray-100 rounded-lg p-4 mt-4">
            <p className="text-gray-600 text-sm mb-2">Horário de Funcionamento:</p>
            <p className="text-gray-800 text-sm">Segunda a Sexta: 9h - 19h</p>
            <p className="text-gray-800 text-sm">Sábado: 9h - 17h</p>
            <p className="text-gray-800 text-sm">Domingo: Fechado</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-5 py-12 bg-primary text-white text-center">
        <h3 className="text-2xl mb-4">Pronta para Transformar suas Unhas?</h3>
        <p className="mb-6 text-purple-100">
          Agende agora e garanta seu horário com a melhor nail designer da região
        </p>
        <button
          onClick={onBookNow}
          className="bg-accent text-white px-12 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          Agendar Agora
        </button>
      </section>

      {/* Footer */}
      <footer className="px-5 py-12 bg-white">
        <div className="max-w-md mx-auto">
          {/* Social Links */}
          <div className="flex justify-center gap-6 mb-8">
            <a
              href="#"
              className="w-12 h-12 bg-background rounded-full flex items-center justify-center hover:bg-accent hover:text-white transition-colors shadow-md"
            >
              <Instagram size={20} />
            </a>
            <a
              href="#"
              className="w-12 h-12 bg-background rounded-full flex items-center justify-center hover:bg-accent hover:text-white transition-colors shadow-md"
            >
              <Phone size={20} />
            </a>
            <a
              href="#"
              className="w-12 h-12 bg-background rounded-full flex items-center justify-center hover:bg-accent hover:text-white transition-colors shadow-md"
            >
              <Mail size={20} />
            </a>
          </div>

          {/* Admin Link */}
          <div className="text-center pt-6 border-t border-gray-200">
            <button
              onClick={onAdminLogin}
              className="text-gray-500 text-xs hover:text-primary transition-colors"
            >
              Área da Profissional
            </button>
          </div>

          {/* Copyright */}
          <div className="text-center mt-6">
            <p className="text-gray-400 text-xs">© 2025 Studio Annika. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Floating CTA Button */}
      <div className="fixed bottom-6 left-0 right-0 px-5 z-30">
        <button
          onClick={onBookNow}
          className="w-full max-w-md mx-auto bg-accent text-white py-5 rounded-2xl shadow-2xl hover:shadow-3xl transition-all flex items-center justify-center gap-2"
        >
          <Calendar size={22} />
          <span className="text-lg">AGENDAR AGORA</span>
        </button>
      </div>
    </div>
  );
}
