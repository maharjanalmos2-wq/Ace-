/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scissors, 
  Ruler, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  ChevronRight, 
  CheckCircle2, 
  ArrowRight,
  Info,
  Star,
  Award,
  ShieldCheck,
  Menu,
  X,
  Sparkles,
  Loader2
} from 'lucide-react';
import { getStyleAdvice, generateMoodBoard, StyleRecommendation } from './services/aiAdvisor';

// --- Types ---

type UnitSystem = 'metric' | 'imperial';

interface MeasurementSet {
  height: string;
  weight: string;
  neck: string;
  chest: string;
  waist: string;
  hips: string;
  sleeve: string;
  inseam: string;
  shoulder: string;
}

const MEASUREMENTS_CONFIG: Record<keyof MeasurementSet, { label: string, metric: string, imperial: string }> = {
  height: { label: 'Height', metric: 'cm', imperial: 'ft' },
  weight: { label: 'Weight', metric: 'kg', imperial: 'lbs' },
  neck: { label: 'Neck', metric: 'cm', imperial: 'inch' },
  chest: { label: 'Chest', metric: 'cm', imperial: 'inch' },
  waist: { label: 'Waist', metric: 'cm', imperial: 'inch' },
  hips: { label: 'Hips', metric: 'cm', imperial: 'inch' },
  sleeve: { label: 'Sleeve', metric: 'cm', imperial: 'inch' },
  inseam: { label: 'Inseam', metric: 'cm', imperial: 'inch' },
  shoulder: { label: 'Shoulder', metric: 'cm', imperial: 'inch' }
};

// --- Constants ---

const SERVICES = [
  { id: 'suit', name: 'Bespoke Suit', duration: '60 min', price: 'From $850', img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800' },
  { id: 'martha', name: 'Martha Collection', duration: '45 min', price: 'From $450', img: 'https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=800' },
  { id: 'shirt', name: 'Custom Shirt', duration: '45 min', price: 'From $140', img: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800' },
  { id: 'alteration', name: 'Alterations', duration: '30 min', price: 'Custom', img: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=800' },
];

const TIME_SLOTS = ['10:00 AM', '11:30 AM', '1:00 PM', '2:30 PM', '4:00 PM', '5:30 PM'];

const GALLERY_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?q=80&w=800', label: 'The Master Tailor' },
  { url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800', label: 'Bespoke Executive' },
  { url: 'https://images.unsplash.com/photo-1485231183945-3dec435917c6?q=80&w=800', label: 'Martha Collection 2026' },
  { url: 'https://images.unsplash.com/photo-1598460350580-e7690f1b73c4?q=80&w=800', label: 'Classic Tuxedo' },
];

// --- Components ---

export default function App() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [measurements, setMeasurements] = useState<MeasurementSet>({
    height: '', weight: '', neck: '', chest: '', waist: '', hips: '', sleeve: '', inseam: '', shoulder: ''
  });
  const [step, setStep] = useState<'home' | 'booking' | 'measurements' | 'collection' | 'advisor'>('home');
  const [selectedService, setSelectedService] = useState<string>('');
  const [bookingDate, setBookingDate] = useState<string>('');
  const [bookingTime, setBookingTime] = useState<string>('');
  const [booked, setBooked] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // AI Advisor state
  const [occasion, setOccasion] = useState('');
  const [details, setDetails] = useState('');
  const [complexion, setComplexion] = useState('');
  const [advice, setAdvice] = useState<StyleRecommendation | null>(null);
  const [isConsulting, setIsConsulting] = useState(false);
  const [moodBoard, setMoodBoard] = useState<string | null>(null);
  const [isGeneratingMoodBoard, setIsGeneratingMoodBoard] = useState(false);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('almos_measurements');
    if (saved) setMeasurements(JSON.parse(saved));
  }, []);

  const saveMeasurements = () => {
    localStorage.setItem('almos_measurements', JSON.stringify(measurements));
    // Soft notification
  };

  const convertValue = (val: string, currentSystem: UnitSystem, targetSystem: UnitSystem, key: keyof MeasurementSet) => {
    if (!val || isNaN(Number(val))) return '';
    const numValue = Number(val);
    if (currentSystem === 'metric' && targetSystem === 'imperial') {
      if (key === 'weight') return (numValue * 2.20462).toFixed(1);
      if (key === 'height') return (numValue / 30.48).toFixed(2);
      return (numValue / 2.54).toFixed(1);
    } else if (currentSystem === 'imperial' && targetSystem === 'metric') {
      if (key === 'weight') return (numValue / 2.20462).toFixed(1);
      if (key === 'height') return (numValue * 30.48).toFixed(1);
      return (numValue * 2.54).toFixed(1);
    }
    return val;
  };

  const toggleUnit = () => {
    const nextSystem = unitSystem === 'metric' ? 'imperial' : 'metric';
    const newMeasurements = { ...measurements };
    (Object.keys(newMeasurements) as Array<keyof MeasurementSet>).forEach(k => {
      const key = k as keyof MeasurementSet;
      newMeasurements[key] = convertValue(newMeasurements[key], unitSystem, nextSystem, key);
    });
    setMeasurements(newMeasurements);
    setUnitSystem(nextSystem);
  };

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setBooked(true);
    setTimeout(() => {
      setBooked(false);
      setStep('home');
    }, 3500);
  };

  const handleConsultation = async () => {
    if (!occasion || !details || !complexion) return;
    setIsConsulting(true);
    setAdvice(null);
    setMoodBoard(null);
    try {
      const result = await getStyleAdvice(occasion, details, complexion, measurements);
      setAdvice(result);
      
      setIsGeneratingMoodBoard(true);
      generateMoodBoard(result)
        .then(setMoodBoard)
        .catch(console.error)
        .finally(() => setIsGeneratingMoodBoard(false));
        
    } catch (error) {
      console.error(error);
    } finally {
      setIsConsulting(false);
    }
  };

  return (
    <div className="min-h-screen selection:bg-brand-gold/30 scroll-smooth overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 premium-blur border-b border-brand-gold/5 px-6 md:px-12 py-4 flex justify-between items-center transition-all duration-300">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => { setStep('home'); setIsMenuOpen(false); }}
        >
          <div className="relative">
            <Scissors className="text-brand-gold w-6 h-6 transform group-hover:rotate-12 transition-transform duration-500" />
            <div className="absolute -inset-1 bg-brand-gold/20 blur opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="font-serif text-2xl tracking-tighter font-extrabold uppercase leading-none">ALMOS <span className="font-light">TAILOR</span></span>
        </div>

        <div className="hidden lg:flex gap-10 text-[11px] font-bold tracking-[0.3em] uppercase items-center">
          <button onClick={() => setStep('home')} className="hover:text-brand-gold transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-px after:bg-brand-gold hover:after:w-full after:transition-all">The Atelier</button>
          <button onClick={() => setStep('collection')} className="hover:text-brand-gold transition-colors">Collections</button>
          <button onClick={() => setStep('measurements')} className="hover:text-brand-gold transition-colors">My Profile</button>
          <button onClick={() => setStep('advisor')} className="hover:text-brand-gold transition-colors flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-brand-gold" />
            AI Advisor
          </button>
          <button 
            onClick={() => setStep('booking')} 
            className="px-8 py-3 bg-brand-charcoal text-white hover:bg-white hover:text-brand-charcoal border border-brand-charcoal transition-all duration-500 ease-out shadow-lg shadow-brand-charcoal/10"
          >
            Book Fitting
          </button>
        </div>

        <button className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-24 px-6 flex flex-col gap-6 lg:hidden"
          >
            <button onClick={() => { setStep('home'); setIsMenuOpen(false); }} className="text-3xl font-serif text-left">The Atelier</button>
            <button onClick={() => { setStep('collection'); setIsMenuOpen(false); }} className="text-3xl font-serif text-left">Collections</button>
            <button onClick={() => { setStep('advisor'); setIsMenuOpen(false); }} className="text-3xl font-serif text-left">AI Advisor</button>
            <button onClick={() => { setStep('measurements'); setIsMenuOpen(false); }} className="text-3xl font-serif text-left">My Profile</button>
            <button onClick={() => { setStep('booking'); setIsMenuOpen(false); }} className="mt-4 px-6 py-4 bg-brand-charcoal text-white text-center">Book Fitting</button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {step === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Split Hero Section */}
            <section className="min-h-screen grid lg:grid-cols-2 pt-16">
              <div className="relative flex flex-col justify-center px-6 md:px-20 lg:px-32 py-20 bg-brand-cream overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/linen.png')]" />
                
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  className="relative z-10"
                >
                  <span className="text-brand-gold tracking-[0.6em] uppercase text-[10px] font-bold mb-8 block">Bespoke Excellence Since 1992</span>
                  <h1 className="text-6xl md:text-8xl xl:text-9xl mb-8 leading-[0.9] tracking-tighter">
                    Beyond <br />
                    <span className="italic font-normal">Measurements</span>
                  </h1>
                  <p className="text-brand-muted max-w-md text-sm md:text-base leading-relaxed mb-12">
                    Tradition meets modernity. We craft garments that don't just fit your body, but reflect your character. Professionalism stitched into every seam.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-6">
                    <button 
                      onClick={() => setStep('collection')}
                      className="group flex items-center justify-between gap-4 px-10 py-5 bg-brand-charcoal text-white hover:bg-brand-gold transition-all duration-500"
                    >
                      EXPLORE COLLECTIONS
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </button>
                    <button 
                      onClick={() => setStep('advisor')}
                      className="group flex items-center justify-between gap-4 px-10 py-5 border border-brand-charcoal text-brand-charcoal hover:bg-brand-charcoal hover:text-white transition-all duration-500"
                    >
                      STYLE ADVISOR
                      <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    </button>
                  </div>

                  <div className="mt-20 grid grid-cols-3 gap-8 opacity-40">
                    <div className="flex flex-col items-center"><Star className="w-5 h-5 mb-2" /><span className="text-[10px] tracking-widest font-bold">PREMIUM</span></div>
                    <div className="flex flex-col items-center"><Award className="w-5 h-5 mb-2" /><span className="text-[10px] tracking-widest font-bold">AWARDS</span></div>
                    <div className="flex flex-col items-center"><ShieldCheck className="w-5 h-5 mb-2" /><span className="text-[10px] tracking-widest font-bold">VERIFIED</span></div>
                  </div>
                </motion.div>
              </div>
              
              <div className="relative h-[60vh] lg:h-auto overflow-hidden">
                <motion.img 
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1.5 }}
                  src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200"
                  alt="Man in premium suit"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-brand-charcoal/10" />
                <div className="absolute bottom-12 left-12 right-12 p-8 backdrop-blur-xl bg-white/10 border border-white/20 text-white">
                  <p className="font-serif italic text-xl mb-2">"A suit is a suit until Almos touches the fabric. Then it becomes a statement."</p>
                  <p className="text-[10px] tracking-[0.4em] uppercase font-bold text-white/60">— The Executive Collection</p>
                </div>
              </div>
            </section>

            {/* The Collection Section */}
            <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
                <div className="max-w-xl">
                  <h2 className="text-4xl md:text-6xl tracking-tight mb-6">Signature <span className="italic">Craft</span></h2>
                  <p className="text-brand-muted leading-relaxed">Our collections represent the pinnacle of sartorial art. From the sharp lines of our executive suits to the fluid elegance of the Martha Collection.</p>
                </div>
                <button onClick={() => setStep('collection')} className="text-xs font-bold tracking-widest uppercase border-b-2 border-brand-gold pb-1 hover:text-brand-gold transition-colors">See all looks</button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {SERVICES.map((s, idx) => (
                  <motion.div 
                    whileHover={{ y: -10 }}
                    key={s.id} 
                    className="relative aspect-[3/4] overflow-hidden group cursor-pointer"
                    onClick={() => { setSelectedService(s.name); setStep('booking'); }}
                  >
                    <img src={s.img} alt={s.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-0 left-0 w-full p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <h3 className="text-white text-xl font-serif mb-1">{s.name}</h3>
                      <p className="text-brand-gold text-xs font-bold tracking-widest uppercase mb-4">{s.price}</p>
                      <button className="text-white text-[10px] tracking-[0.3em] font-bold uppercase flex items-center gap-2">Book Fitting <ChevronRight className="w-3 h-3" /></button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </motion.div>
        )}

        {step === 'collection' && (
          <motion.div 
            key="collection" 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto"
          >
            <div className="text-center mb-20 max-w-2xl mx-auto">
              <span className="text-brand-gold tracking-[0.5em] uppercase text-[10px] font-bold mb-4 block">Visual Archive</span>
              <h2 className="text-5xl italic font-normal mb-6">Gallery of Elegance</h2>
              <p className="text-brand-muted text-sm leading-relaxed">A specialized showcase of our most remarkable creations, including the renowned Martha female collection.</p>
            </div>

            <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
              {GALLERY_IMAGES.map((img, i) => (
                <div key={i} className="break-inside-avoid relative group overflow-hidden bg-brand-charcoal">
                  <img 
                    src={img.url} 
                    alt={img.label} 
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 border-[1.5rem] border-transparent group-hover:border-white/10 transition-all duration-500" />
                  <div className="absolute bottom-6 left-6 text-white translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                    <p className="text-[10px] font-bold tracking-widest uppercase mb-1">{img.label}</p>
                    <div className="h-px w-8 bg-brand-gold" />
                  </div>
                </div>
              ))}
              {/* Specialized Martha Showcase */}
              <div className="break-inside-avoid bg-brand-charcoal p-12 text-white flex flex-col justify-center gap-6">
                <h3 className="text-4xl font-serif italic text-brand-gold">The Martha collection</h3>
                <p className="text-sm leading-relaxed text-zinc-400">Designed for the modern woman who demands authority without sacrificial elegance. Sharp shoulders, fluid drape, immortal style.</p>
                <button 
                  onClick={() => { setSelectedService('Martha Collection'); setStep('booking'); }}
                  className="w-fit border border-brand-gold px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold hover:text-brand-charcoal transition-all"
                >
                  Consultation
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {(step === 'measurements' || step === 'booking' || step === 'advisor') && (
          <motion.div 
            key="forms"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-32 pb-24 px-6 md:px-12"
          >
            {step === 'advisor' ? (
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                  <span className="text-brand-gold tracking-[0.5em] uppercase text-[10px] font-bold mb-4 block underline underline-offset-8 decoration-1">The Almos Advisor</span>
                  <h2 className="text-5xl italic font-normal mb-4">Intelligent Sartorial Guidance</h2>
                  <p className="text-brand-muted max-w-lg mx-auto">Tell us the occasion, and our AI-powered master tailor will propose the perfect ensemble tailored to your silhouette.</p>
                </div>

                <div className="bg-white shadow-2xl border border-zinc-100 overflow-hidden">
                  <div className="p-8 md:p-12 border-b border-zinc-50 space-y-8">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] mb-3 block text-brand-muted">What is the occasion?</label>
                      <input 
                        type="text" 
                        value={occasion}
                        onChange={(e) => setOccasion(e.target.value)}
                        placeholder="e.g. Summer Wedding in Tuscany, Board Meeting, Charity Gala..."
                        className="w-full bg-brand-cream/30 border-none outline-none px-6 py-5 text-sm font-serif"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] mb-3 block text-brand-muted">Personal Details / Build</label>
                        <input 
                          type="text" 
                          value={details}
                          onChange={(e) => setDetails(e.target.value)}
                          placeholder="e.g. Athletic build, prefer classic fits..."
                          className="w-full bg-brand-cream/30 border-none outline-none px-6 py-5 text-sm font-serif"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] mb-3 block text-brand-muted">Complexion / Skin Tone</label>
                        <input 
                          type="text" 
                          value={complexion}
                          onChange={(e) => setComplexion(e.target.value)}
                          placeholder="e.g. Olive skin, Fair, Warm undertones..."
                          className="w-full bg-brand-cream/30 border-none outline-none px-6 py-5 text-sm font-serif"
                        />
                      </div>
                    </div>
                    <button 
                      onClick={handleConsultation}
                      disabled={!occasion || !details || !complexion || isConsulting}
                      className="w-full py-5 bg-brand-charcoal text-[10px] font-bold tracking-[0.3em] uppercase text-white hover:bg-brand-gold disabled:opacity-30 transition-all flex items-center justify-center gap-3"
                    >
                      {isConsulting ? <><Loader2 className="w-5 h-5 animate-spin" /> Curating Style...</> : <><Sparkles className="w-4 h-4" /> Consult AI Advisor</>}
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {advice && !isConsulting && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-8 md:p-12 bg-zinc-50/50"
                      >
                        <div className="grid md:grid-cols-2 gap-12 border-b border-zinc-200/60 pb-12 mb-12">
                          <div className="space-y-8">
                            <div>
                              <h4 className="text-[10px] font-bold tracking-widest uppercase text-brand-gold mb-3">Recommended Fabric</h4>
                              <p className="text-xl font-serif text-brand-charcoal">{advice.fabric}</p>
                            </div>
                            <div>
                              <h4 className="text-[10px] font-bold tracking-widest uppercase text-brand-gold mb-3">The Cut</h4>
                              <p className="text-xl font-serif text-brand-charcoal">{advice.cut}</p>
                            </div>
                          </div>
                          <div className="space-y-8">
                            <div>
                              <h4 className="text-[10px] font-bold tracking-widest uppercase text-brand-gold mb-3">Styling Decorum</h4>
                              <ul className="space-y-3">
                                {advice.stylingTips.map((tip, i) => (
                                  <li key={i} className="flex gap-3 text-sm text-brand-muted">
                                    <span className="text-brand-gold select-none">—</span> {tip}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <button 
                              onClick={() => { setSelectedService('Bespoke Suit'); setStep('booking'); }}
                              className="w-full py-4 border border-brand-charcoal text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-brand-charcoal hover:text-white transition-all"
                            >
                              Discuss this look
                            </button>
                          </div>
                        </div>

                        {/* Mood Board Section */}
                        <div className="space-y-6">
                           <div className="flex items-center justify-between">
                             <h4 className="text-xl font-serif text-brand-charcoal">Visual Inspiration</h4>
                             {isGeneratingMoodBoard && <span className="text-[10px] font-bold tracking-widest uppercase text-brand-gold flex items-center gap-2 animate-pulse"><Sparkles className="w-3 h-3" /> Drafting Mood Board...</span>}
                           </div>
                           
                           <div className="relative aspect-video bg-brand-charcoal/5 border border-zinc-200 flex items-center justify-center overflow-hidden">
                              {moodBoard ? (
                                <motion.img 
                                  initial={{ opacity: 0, scale: 1.05 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.8 }}
                                  src={moodBoard} 
                                  alt="Style Mood Board" 
                                  className="w-full h-full object-cover" 
                                />
                              ) : isGeneratingMoodBoard ? (
                                <div className="text-brand-muted flex flex-col items-center gap-4">
                                  <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
                                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Curating Fabrics & Fits</span>
                                </div>
                              ) : null}
                           </div>
                        </div>

                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : step === 'measurements' ? (
              <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-16">
                <div className="lg:col-span-4">
                  <h2 className="text-5xl tracking-tight mb-6">Your <span className="italic">Profile</span></h2>
                  <p className="text-brand-muted text-sm leading-relaxed mb-8">Maintain your digital silhouette. Our precision engine handles conversions instantly, ensuring your data is ready for the atelier.</p>
                  
                  <div className="bg-brand-charcoal text-white p-8 rounded-sm">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-[10px] font-bold tracking-widest uppercase">Select System</span>
                      <button onClick={toggleUnit} className="text-brand-gold text-[10px] font-bold underline underline-offset-4">{unitSystem === 'metric' ? 'IMPERIAL (IN/LBS)' : 'METRIC (CM/KG)'}</button>
                    </div>
                    <div className="space-y-4 mb-8">
                       <p className="text-zinc-400 text-xs italic">"Measurements are the lyrics, but the fit is the song."</p>
                    </div>
                    <button 
                      onClick={saveMeasurements}
                      className="w-full py-4 bg-brand-gold text-brand-charcoal font-bold tracking-widest text-xs uppercase hover:bg-white transition-all shadow-xl"
                    >
                      SAVE PROFILE
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-8 bg-white shadow-2xl p-8 md:p-16 border border-zinc-100">
                  <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                    {(Object.keys(measurements) as Array<keyof MeasurementSet>).map((key) => {
                      const config = MEASUREMENTS_CONFIG[key];
                      return (
                        <div key={key} className="space-y-3">
                          <label className="text-[10px] font-extrabold uppercase tracking-widest text-brand-muted flex justify-between">
                            {config.label} <span className="text-brand-gold">{unitSystem === 'metric' ? config.metric : config.imperial}</span>
                          </label>
                          <div className="relative">
                            <input 
                              type="number" 
                              value={measurements[key]}
                              onChange={(e) => setMeasurements({...measurements, [key]: e.target.value})}
                              className="w-full bg-brand-cream/30 border-none outline-none px-6 py-4 text-xl font-serif text-brand-charcoal placeholder:text-zinc-200"
                              placeholder="0.0"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 hover:opacity-100 transition-opacity cursor-help">
                              <Info className="w-4 h-4 text-brand-gold" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16 px-4">
                  <h2 className="text-5xl italic font-normal mb-4">Request a Consultation</h2>
                  <p className="text-brand-muted">Private appointments are held at our Mayfair atelier.</p>
                </div>

                {booked ? (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-brand-charcoal py-24 px-12 text-center text-white border-2 border-brand-gold shadow-2xl"
                  >
                    <CheckCircle2 className="w-16 h-16 text-brand-gold mx-auto mb-8 stroke-1" />
                    <h3 className="text-4xl font-serif mb-4">Slot Reserved</h3>
                    <p className="text-zinc-400 max-w-sm mx-auto">Our head tailor will review your request and confirm via email within 2 hours.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleBooking} className="bg-white shadow-2xl overflow-hidden border border-zinc-100 flex flex-col md:grid md:grid-cols-5">
                    <div className="col-span-2 bg-brand-cream/40 p-10 border-r border-zinc-100">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-10 text-brand-muted">Service Details</h4>
                      <div className="space-y-3">
                        {SERVICES.map(s => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setSelectedService(s.name)}
                            className={`w-full p-5 text-left border-l-4 transition-all flex justify-between items-center ${selectedService === s.name ? 'border-brand-gold bg-white shadow-md' : 'border-transparent hover:bg-white'}`}
                          >
                            <span className="text-xs font-bold uppercase tracking-tight">{s.name}</span>
                            <span className="text-[10px] text-brand-gold font-bold">{s.price}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="col-span-3 p-10 md:p-16 space-y-10">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"><Calendar className="w-3 h-3 text-brand-gold" /> Preferred Date</label>
                          <input type="date" required value={bookingDate} onChange={e => setBookingDate(e.target.value)} className="w-full bg-brand-cream/50 px-4 py-4 outline-none text-xs font-bold" />
                        </div>
                        <div className="space-y-4">
                          <label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"><Clock className="w-3 h-3 text-brand-gold" /> Preferred Time</label>
                          <select required value={bookingTime} onChange={e => setBookingTime(e.target.value)} className="w-full bg-brand-cream/50 px-4 py-4 outline-none text-xs font-bold appearance-none">
                            <option value="">SELECT TIME</option>
                            {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-4 p-8 bg-zinc-50 border border-zinc-100">
                         <h4 className="text-[10px] font-bold uppercase tracking-widest mb-2">Personal Information</h4>
                         <input required type="text" placeholder="FULL NAME" className="w-full bg-transparent border-b border-zinc-200 py-3 outline-none text-xs tracking-widest placeholder:text-zinc-300" />
                         <input required type="email" placeholder="EMAIL ADDRESS" className="w-full bg-transparent border-b border-zinc-200 py-3 outline-none text-xs tracking-widest placeholder:text-zinc-300" />
                      </div>

                      <button 
                         type="submit"
                         disabled={!selectedService || !bookingDate || !bookingTime}
                         className="w-full py-6 bg-brand-charcoal text-white font-bold tracking-[0.4em] uppercase text-xs hover:bg-brand-gold transition-all duration-700 shadow-xl disabled:opacity-30 disabled:cursor-not-allowed group"
                      >
                         Confirm Appointment
                      </button>
                      <p className="text-[10px] text-center text-zinc-400 italic">By booking, you agree to our 24h cancellation policy.</p>
                    </div>
                  </form>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trust Bar */}
      <section className="py-20 bg-white border-t border-zinc-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-12 md:gap-24 grayscale opacity-30">
            <span className="text-2xl font-serif tracking-widest italic font-bold">VOGUE</span>
            <span className="text-2xl font-serif tracking-widest italic font-bold">GQ</span>
            <span className="text-2xl font-serif tracking-widest italic font-bold">FORBES</span>
            <span className="text-2xl font-serif tracking-widest italic font-bold">HARPER'S</span>
          </div>
        </div>
      </section>

      {/* Luxury Footer */}
      <footer className="bg-brand-charcoal pt-24 pb-12 px-6 md:px-12 text-white relative">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-16 mb-24">
          <div className="lg:col-span-2">
             <h3 className="text-3xl font-serif mb-8 tracking-tighter uppercase font-black">ALMOS <span className="font-light">TAILOR</span></h3>
             <p className="text-zinc-400 text-sm leading-relaxed max-w-sm mb-12">
               Established in 1992, Almos Tailor remains a beacon of bespoke excellence in Mayfair. We believe that clothing is the ultimate architecture for the soul.
             </p>
             <div className="flex gap-4">
                <div className="w-10 h-10 border border-white/10 flex items-center justify-center hover:border-brand-gold transition-colors cursor-pointer"><Scissors className="w-4 h-4 text-brand-gold" /></div>
                <div className="w-10 h-10 border border-white/10 flex items-center justify-center hover:border-brand-gold transition-colors cursor-pointer"><MapPin className="w-4 h-4 text-brand-gold" /></div>
                <div className="w-10 h-10 border border-white/10 flex items-center justify-center hover:border-brand-gold transition-colors cursor-pointer"><Phone className="w-4 h-4 text-brand-gold" /></div>
             </div>
          </div>
          
          <div>
            <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-brand-gold mb-10">Concierge</h4>
            <ul className="space-y-4 text-xs font-bold tracking-widest text-zinc-400">
              <li><button onClick={() => setStep('home')} className="hover:text-white transition-colors">THE ATELIER</button></li>
              <li><button onClick={() => setStep('collection')} className="hover:text-white transition-colors">COLLECTIONS</button></li>
              <li><button onClick={() => setStep('measurements')} className="hover:text-white transition-colors">MEASUREMENT GUIDE</button></li>
              <li><button onClick={() => setStep('booking')} className="hover:text-white transition-colors">BOOK CONSULTATION</button></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-brand-gold mb-10">Private Updates</h4>
            <p className="text-xs text-zinc-400 tracking-wider">Join our circle for seasonal collection previews and bespoke insights.</p>
            <div className="flex border-b border-white/10 pb-4">
              <input type="email" placeholder="EMAIL" className="bg-transparent border-none outline-none text-[10px] tracking-widest w-full" />
              <button className="text-brand-gold hover:translate-x-2 transition-transform"><ArrowRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] tracking-[0.5em] font-bold text-zinc-500 uppercase">
          <span>&copy; 1992—2026 Almos Tailor Atelier</span>
          <div className="flex gap-12">
            <a href="#" className="hover:text-white transition-all">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-all">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
