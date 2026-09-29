import React, { useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Search,
  Sparkles,
  Sliders,
  Activity,
  Layers,
  Volume2,
  Cpu,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Maximize2,
  Minimize2,
  Film,
  Camera,
  Music,
} from 'lucide-react';

interface GuideSection {
  id: string;
  category: 'setup' | 'color' | 'scopes' | 'fusion' | 'fairlight' | 'delivery';
  rubricNumber: number;
  title: string;
  badge: string;
  summary: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export const DaVinciGuide: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'rubric-1': true,
    'rubric-2': true,
    'rubric-3': false,
    'rubric-4': false,
    'rubric-5': false,
    'rubric-6': false,
    'rubric-7': false,
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExpandAll = () => {
    const allOpen: Record<string, boolean> = {};
    sections.forEach((s) => (allOpen[s.id] = true));
    setOpenSections(allOpen);
  };

  const handleCollapseAll = () => {
    const allClosed: Record<string, boolean> = {};
    sections.forEach((s) => (allClosed[s.id] = false));
    setOpenSections(allClosed);
  };

  const sections: GuideSection[] = [
    {
      id: 'rubric-1',
      category: 'setup',
      rubricNumber: 1,
      title: 'Instalare Rapidă & Integrare Windows 11 (Drepturi Administrator)',
      badge: 'Bază & Configurare',
      summary: 'Directoare de sistem protejate, actualizarea listelor fără repornire și remedierea devierii gamma pe Mac/QuickTime.',
      icon: <Cpu className="w-4 h-4 text-emerald-400" />,
      content: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#121622] p-4 rounded-xl border border-[#212b3c] space-y-2">
              <span className="font-bold text-amber-400 font-mono text-[11px] block uppercase">
                1.1 Directoarele Oficiale de LUT-uri
              </span>
              <p>
                DaVinci Resolve Studio scanează automat fișierele <code className="text-amber-300 font-mono">.cube</code> din directorul protejat de sistem:
              </p>
              <div className="bg-[#0b0e14] p-2.5 rounded font-mono text-[11px] text-slate-300 space-y-1">
                <div><span className="text-emerald-400 font-bold">Windows 11:</span> C:\ProgramData\Blackmagic Design\DaVinci Resolve\Support\LUT\</div>
                <div><span className="text-sky-400 font-bold">macOS:</span> ~/Library/Application Support/Blackmagic Design/DaVinci Resolve/LUT/</div>
              </div>
              <p className="text-[11px] text-slate-400">
                <em>Sfat Pro:</em> Folderul <code className="text-slate-300 font-mono">C:\ProgramData</code> este ascuns implicit în Windows 11. Bifați <em>View → Show → Hidden items</em> în Windows Explorer sau folosiți butonul din aplicație de instalare directă ca Administrator.
              </p>
            </div>

            <div className="bg-[#121622] p-4 rounded-xl border border-[#212b3c] space-y-2">
              <span className="font-bold text-amber-400 font-mono text-[11px] block uppercase">
                1.2 Actualizare Instantanee Fără Repornire
              </span>
              <p>
                După copierea unui fișier <code className="text-amber-300 font-mono">.cube</code>, <strong>nu este nevoie să reporniți DaVinci Resolve</strong>:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-300 pl-1">
                <li>Deschideți pagina <strong>Color</strong> (<kbd className="bg-[#1c2332] px-1 py-0.5 rounded text-amber-300 font-mono">Shift + 6</kbd>).</li>
                <li>Faceți clic dreapta în galeria de LUT-uri din stânga-sus și alegeți <strong>„Refresh”</strong>.</li>
                <li>Sau: <em>Project Settings (Shift+9) → Color Management → apăsați butonul <strong>„Update Lists”</strong></em>.</li>
              </ol>
              <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-semibold mt-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Toate LUT-urile noi devin active instantaneu în timeline!</span>
              </div>
            </div>
          </div>

          <div className="bg-[#10141e] p-3.5 rounded-lg border border-amber-500/20 flex items-start gap-2.5">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong className="text-white">Remedierea devierii de contrast Mac QuickTime (Gamma Shift Bug):</strong> Când exportați proiectul pentru clienți care vizualizează pe iPhone sau Mac QuickTime Player, în panoul <em>Project Settings → Color Management</em> sau în tab-ul <em>Deliver</em> setați <strong>Color Space Tag: Rec.709</strong> și <strong>Gamma Tag: Rec.709-A</strong>. Astfel, culorile din DaVinci Resolve vor fi identice 1:1 cu cele din QuickTime și Safari!
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'rubric-2',
      category: 'color',
      rubricNumber: 2,
      title: 'Coloristică Profesională: Structura Arborelui de Noduri (Node Tree)',
      badge: 'Color Grading Pro',
      summary: 'Ordinea operațiunilor de procesare, utilizarea Color Space Transform (CST) și controlul intensității prin Key Output Gain.',
      icon: <Layers className="w-4 h-4 text-amber-400" />,
      content: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="bg-[#121622] p-4 rounded-xl border border-[#212b3c] space-y-3">
            <span className="font-bold text-white uppercase tracking-wider text-xs block">
              Arhitectura Standard Recomandată a Arborelui de Noduri (Fixed Node Tree):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-[11px]">
              <div className="bg-[#171d2b] p-3 rounded-lg border border-[#263246] space-y-1">
                <span className="text-amber-400 font-bold block">NOD 01: CST IN / RAW</span>
                <p className="text-[11px] text-slate-300 font-sans">Conversia camerei (Sony S-Log3, Canon C-Log, Panasonic V-Log) în DaVinci Wide Gamut.</p>
              </div>
              <div className="bg-[#171d2b] p-3 rounded-lg border border-[#263246] space-y-1">
                <span className="text-amber-400 font-bold block">NOD 02: PRIMARIES BALANS</span>
                <p className="text-[11px] text-slate-300 font-sans">Expunere globală (Offset wheel) și balans de alb neutru la 5600K/3200K.</p>
              </div>
              <div className="bg-[#171d2b] p-3 rounded-lg border border-[#263246] space-y-1">
                <span className="text-amber-400 font-bold block">NOD 03: CONTRAST & PIVOT</span>
                <p className="text-[11px] text-slate-300 font-sans">Curba S cinematografică și pivotul DaVinci reglat la 0.435 pentru protejarea tenului.</p>
              </div>
              <div className="bg-[#171d2b] p-3 rounded-lg border border-[#263246] space-y-1">
                <span className="text-amber-400 font-bold block">NOD 04: QUALIFIER TEN</span>
                <p className="text-[11px] text-slate-300 font-sans">Izolare nuanță de piele cu HSL Qualifier, saturație dedicată și corecție roșeață.</p>
              </div>
              <div className="bg-[#171d2b] p-3 rounded-lg border border-[#263246] space-y-1">
                <span className="text-amber-400 font-bold block">NOD 05: LOOK / LUT CREATIV</span>
                <p className="text-[11px] text-slate-300 font-sans">Aplicarea LUT-ului de nuntă (Boho, Portra, Light & Airy) cu Key Output Gain la 0.4 - 0.7.</p>
              </div>
              <div className="bg-[#171d2b] p-3 rounded-lg border border-[#263246] space-y-1">
                <span className="text-amber-400 font-bold block">NOD 06: SPLIT TONING & CROSSOVER</span>
                <p className="text-[11px] text-slate-300 font-sans">Viraj cromatic subtil în umbre (teal/rece) și lumini calde (auriu/miere). Punctul de tranziție (Crossover Point / Split Balance) reglează pragul exact de luminanță IRE (20-80 IRE) de separare tonală.</p>
              </div>
              <div className="bg-[#171d2b] p-3 rounded-lg border border-[#263246] space-y-1">
                <span className="text-amber-400 font-bold block">NOD 07: CST OUT (REC.709)</span>
                <p className="text-[11px] text-slate-300 font-sans">Mapare finală din spațiul intermediar în Rec.709 Gamma 2.4 cu Gamut Compression.</p>
              </div>
              <div className="bg-[#171d2b] p-3 rounded-lg border border-[#263246] space-y-1">
                <span className="text-amber-400 font-bold block">NOD 08: FILM GRAIN</span>
                <p className="text-[11px] text-slate-300 font-sans">Granulație fină organică de 35mm pentru spargerea zgomotului digital.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#141926] p-3.5 rounded-lg border border-[#232c3f] space-y-1.5">
              <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Cum se atenuează un LUT prea puternic:
              </span>
              <p className="text-[11px] text-slate-300">
                Nu modificați niciodată opacitatea din nod cu blend mode. Selectați nodul pe care este aplicat LUT-ul, deschideți paleta <strong>Key</strong> (pictograma de cheie din mijlocul barei de unelte) și coborâți <strong>Key Output → Gain</strong> de la <code className="text-amber-300 font-mono">1.000</code> la <code className="text-amber-300 font-mono">0.500</code> sau <code className="text-amber-300 font-mono">0.350</code>. Astfel păstrați caracterul curbelor fără asprime.
              </p>
            </div>

            <div className="bg-[#141926] p-3.5 rounded-lg border border-[#232c3f] space-y-1.5">
              <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                Greșeala frecventă a începătorilor:
              </span>
              <p className="text-[11px] text-slate-300">
                Nu aplicați niciodată LUT-ul pe primul nod! Dacă LUT-ul este pe primul nod, orice ajustare de expunere din nodurile următoare va tăia datele cromatice deja comprimate de LUT. LUT-ul trebuie să stea întotdeauna spre <strong>sfârșitul lanțului de noduri</strong>, după nodurile de balans primar și corecție de expunere.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'rubric-3',
      category: 'scopes',
      rubricNumber: 3,
      title: 'Vectorscopul & Calibrarea Liniei de Ten (Skin Tone Indicator)',
      badge: 'Analiză Cromatică',
      summary: 'Unghiul de 10:30 al melaninei, căsuțele de 75% saturație și eliminarea tentelor nedorite în umbre.',
      icon: <Activity className="w-4 h-4 text-rose-400" />,
      content: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#121622] p-4 rounded-xl border border-[#212b3c] space-y-2 md:col-span-2">
              <span className="font-bold text-amber-400 font-mono text-[11px] block uppercase">
                3.1 Știința Liniei de Ten (Skin Tone Line / I-Line)
              </span>
              <p>
                În fereastra Vectorscop din DaVinci Resolve, activați <strong>„Show Skin Tone Indicator”</strong> din rotița de setări a osciloscopului.
              </p>
              <p>
                Linia punctată orientată spre ora <strong>10:30 (între roșu și galben)</strong> reprezintă spectrul fiziologic de absorbție a luminii de către hemoglobina și melanina umană. <strong>Indiferent de naționalitate sau culoarea pielii</strong> (de la piele deschisă nordică până la piele închisă africană), sângele de sub piele face ca nuanța pură de ten să cadă exact pe această linie!
              </p>
              <div className="bg-[#0b0e14] p-3 rounded border border-[#1f283a] text-[11px] space-y-1">
                <div>• <strong className="text-amber-300">Dacă semnalul cade deasupra liniei (spre galben):</strong> tenul pare bolnăvicios/gălbejit. Adăugați puțin Magenta în Gain sau rotița de Tint.</div>
                <div>• <strong className="text-rose-400">Dacă semnalul cade sub linie (spre roșu/magenta):</strong> tenul este ars de soare sau congestionat. Adăugați puțin Verde/Galben.</div>
              </div>
            </div>

            <div className="bg-[#121622] p-4 rounded-xl border border-[#212b3c] space-y-2">
              <span className="font-bold text-amber-400 font-mono text-[11px] block uppercase">
                3.2 Căsuțele de Saturație 75%
              </span>
              <p>
                Pătratele marcate cu <strong>R, Mg, B, Cy, G, Yl</strong> pe vectorscop reprezintă limita de 75% din spațiul Rec.709.
              </p>
              <p>
                Dacă semnalul cromatic depășește aceste căsuțe (mai ales pe lumini de club DJ sau lasere), culorile vor deveni clipite (neon-flat) și vor genera artefacte de compresie urâte pe telefoane sau monitoare standard.
              </p>
            </div>
          </div>

          <div className="bg-[#10141e] p-3.5 rounded-lg border border-rose-500/20 flex items-start gap-2.5">
            <Eye className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong className="text-white">Truc Rapid de Izolare:</strong> În pagina Color, folosiți scurtătura <kbd className="bg-[#1c2332] px-1 py-0.5 rounded text-amber-300 font-mono">Shift + H</kbd> pentru a vizualiza doar masca selectată a feței mirilor. Astfel, vectorscopul va afișa exclusiv semnalul feței, permițându-vă să aliniați tenul cu precizie milimetrică pe axa 10:30!
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'rubric-4',
      category: 'scopes',
      rubricNumber: 4,
      title: 'Histograma, Waveform & RGB Parade: Balansul Perfect al Expunerii',
      badge: 'Analiză Expunere',
      summary: 'Niveluri IRE calibrate pentru rochie albă și smoking negru, analiza coloanelor RGB Parade și recuperarea umbrelor.',
      icon: <Activity className="w-4 h-4 text-sky-400" />,
      content: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#121622] p-4 rounded-xl border border-[#212b3c] space-y-2">
              <span className="font-bold text-sky-400 font-mono text-[11px] block uppercase">
                4.1 Nivelurile Recomandate pe Scara Waveform (IRE)
              </span>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                <li className="flex justify-between border-b border-[#1c2434] pb-1">
                  <span className="font-semibold text-white">Negru Absolut / Podea Digitală:</span>
                  <span className="font-mono text-amber-400">0 - 5 IRE</span>
                </li>
                <li className="flex justify-between border-b border-[#1c2434] pb-1">
                  <span className="font-semibold text-white">Costume Negre & Smoking Mire:</span>
                  <span className="font-mono text-amber-400">10 - 25 IRE (textură vizibilă)</span>
                </li>
                <li className="flex justify-between border-b border-[#1c2434] pb-1">
                  <span className="font-semibold text-white">Tenul Oamenilor (Fețele Mirilor):</span>
                  <span className="font-mono text-amber-400">45 - 65 IRE (expunere naturală)</span>
                </li>
                <li className="flex justify-between border-b border-[#1c2434] pb-1">
                  <span className="font-semibold text-white">Rochia Albă de Mireasă & Cămăși:</span>
                  <span className="font-mono text-amber-400">80 - 90 IRE (fără arsuri pe dantelă)</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-semibold text-white">Reflexii Solare Speculare & Artificii:</span>
                  <span className="font-mono text-amber-400">95 - 100 IRE (roll-off catifelat)</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#121622] p-4 rounded-xl border border-[#212b3c] space-y-2">
              <span className="font-bold text-sky-400 font-mono text-[11px] block uppercase">
                4.2 Balans de Alb Ultra-Rapid pe RGB Parade
              </span>
              <p>
                RGB Parade separă semnalul în 3 coloane paralele: <strong>Roșu (R), Verde (G) și Albastru (B)</strong>.
              </p>
              <p>
                Priviți vârful coloanelor pe o zonă neutră din cadru (rochia albă de mireasă, o cămașă albă sau o față de masă). Dacă vârful roșu este mai sus decât albastru, imaginea este caldă. Dacă albastrul este mai sus, imaginea este rece.
              </p>
              <div className="bg-[#0b0e14] p-2.5 rounded font-mono text-[11px] text-emerald-400">
                ✓ Ajustați rotița de Temperatură și Tint până când nivelul superior al celor 3 canale se aliniază la aceeași înălțime orizontală!
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'rubric-5',
      category: 'fusion',
      rubricNumber: 5,
      title: 'Fusion: VFX, Planar Tracking, Retuș Ten & Efecte Organice',
      badge: 'VFX & Retuș Ten',
      summary: 'Frequency Separation pentru imperfecțiuni de piele, tracking planar pentru măști pe miri și optimizarea memoriei cache.',
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
      content: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#121622] p-4 rounded-xl border border-[#212b3c] space-y-2">
              <span className="font-bold text-purple-400 font-mono text-[11px] block uppercase">
                5.1 Retuș Ten Fără Aspect de Plastic (Frequency Separation)
              </span>
              <p>
                În pagina <strong>Fusion</strong>, puteți separa frecvențele joase (culoarea și petele roșii) de frecvențele înalte (textura porilor și a genelor).
              </p>
              <p>
                Prin aplicarea unui blur doar pe canalul de frecvență joasă, neteziți nuanțele de piele și cearcănele miresei, păstrând în același timp textura organică naturală a pielii, fără aspectul artificial de filtru Instagram!
              </p>
            </div>

            <div className="bg-[#121622] p-4 rounded-xl border border-[#212b3c] space-y-2">
              <span className="font-bold text-purple-400 font-mono text-[11px] block uppercase">
                5.2 Planar Tracker & Stabilizare Inteligentă
              </span>
              <p>
                Dacă mirii dansează sau merg spre altar, folosiți <strong>Planar Tracker</strong> (Shift+Space → Planar Tracker):
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1 text-[11px]">
                <li>Desenați o formă în jurul feței sau al rochiei.</li>
                <li>Setați <em>Tracker Type: Hybrid Point / Area</em> și <em>Motion Type: Translation, Rotation, Scale</em>.</li>
                <li>Apăsați <em>Track Forward</em> pentru a genera o mască perfect ancorată pe mișcare.</li>
              </ul>
            </div>
          </div>

          <div className="bg-[#10141e] p-3.5 rounded-lg border border-purple-500/20 flex items-start gap-2.5">
            <Lightbulb className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong className="text-white">Optimizare Playback Fusion:</strong> Compozițiile Fusion complexe pot încetini redarea. Faceți clic dreapta pe nodul final <code className="text-slate-300 font-mono">MediaOut</code> și bifați <strong>„Cache to Disk”</strong> sau din meniul de sus alegeți <em>Playback → Render Cache → Smart</em>.
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'rubric-6',
      category: 'fairlight',
      rubricNumber: 6,
      title: 'Fairlight: Sunet Clar, Voice Isolation & Mastering LUFS pentru Web',
      badge: 'Audio & Mastering',
      summary: 'Izolarea vocilor mirilor în vânt sau biserici cu ecou, egalizatorul vocal pe 6 benzi și pragul de -14 LUFS pentru YouTube.',
      icon: <Volume2 className="w-4 h-4 text-emerald-400" />,
      content: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#121622] p-4 rounded-xl border border-[#212b3c] space-y-2">
              <span className="font-bold text-emerald-400 font-mono text-[11px] block uppercase">
                6.1 Voice Isolation & Dialogue Leveler (DaVinci Studio)
              </span>
              <p>
                În pagina <strong>Fairlight</strong> sau în panoul Inspector al oricărui clip audio:
              </p>
              <div className="bg-[#0b0e14] p-2.5 rounded font-mono text-[11px] space-y-1">
                <div>• <strong className="text-emerald-400">Voice Isolation:</strong> Activați butonul și setați sliderul între <strong>60% și 80%</strong>. Elimină zgomotul de vânt la cununia în aer liber, aparatele foto ale invitaților și ecoul din biserică!</div>
                <div>• <strong className="text-amber-400">Dialogue Leveler:</strong> Egalizează automat diferențele mari de volum dintre preot și jurămintele șoptite ale mirilor.</div>
              </div>
            </div>

            <div className="bg-[#121622] p-4 rounded-xl border border-[#212b3c] space-y-2">
              <span className="font-bold text-emerald-400 font-mono text-[11px] block uppercase">
                6.2 Standarde LUFS Recomandate la Export
              </span>
              <ul className="space-y-1 text-[11px] text-slate-300">
                <li className="flex justify-between border-b border-[#1c2434] pb-1">
                  <span className="font-semibold text-white">YouTube, TikTok & Instagram:</span>
                  <span className="font-mono text-amber-400">-14 LUFS Integrat (True Peak -1.0 dBTP)</span>
                </li>
                <li className="flex justify-between border-b border-[#1c2434] pb-1">
                  <span className="font-semibold text-white">Vimeo (Portofoliu Film):</span>
                  <span className="font-mono text-amber-400">-16 LUFS Integrat</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-semibold text-white">Emisie TV (Standard Broadcast):</span>
                  <span className="font-mono text-amber-400">-23 LUFS (EBU R128)</span>
                </li>
              </ul>
              <p className="text-[11px] text-slate-400 mt-1">
                <em>Sfat:</em> Activați <strong>Limiter-ul pe canalul Bus 1 (Master)</strong> setat la Ceiling <code className="text-amber-300 font-mono">-1.0 dB</code> pentru a împiedica orice distorsiune inter-sample pe telefoanele mobile ale mirilor.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'rubric-7',
      category: 'delivery',
      rubricNumber: 7,
      title: 'Performanță Hardware, GPU & Setări Optime de Export (Deliver Page)',
      badge: 'Randare & Export',
      summary: 'Configurare GPU (CUDA / Metal), memorie cache pe SSD NVMe și setări de bitrate H.265 pentru nunți 4K.',
      icon: <Film className="w-4 h-4 text-amber-400" />,
      content: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#121622] p-4 rounded-xl border border-[#212b3c] space-y-2">
              <span className="font-bold text-amber-400 font-mono text-[11px] block uppercase">
                7.1 Setări Optime în Pagina Deliver (Export Nuntă 4K)
              </span>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                <li>• <strong>Format:</strong> MP4 sau QuickTime</li>
                <li>• <strong>Codec:</strong> H.265 (HEVC) cu <em>Encoder: NVIDIA NVENC / Apple Metal</em> pentru randare de 5x mai rapidă</li>
                <li>• <strong>Quality / Bitrate:</strong> Restrict to <code className="text-amber-300 font-mono">55,000 Kbps</code> pentru 4K la 24/25/30 fps</li>
                <li>• <strong>Color Space Tag:</strong> Rec.709 | <strong>Gamma Tag:</strong> Rec.709-A</li>
              </ul>
            </div>

            <div className="bg-[#121622] p-4 rounded-xl border border-[#212b3c] space-y-2">
              <span className="font-bold text-amber-400 font-mono text-[11px] block uppercase">
                7.2 Optimizarea Vitezei de Redare pe Timeline
              </span>
              <p>
                Dacă timeline-ul 4K sacadează în timpul montajului:
              </p>
              <ul className="space-y-1 text-[11px] text-slate-300">
                <li>1. Mergeți la <em>Playback → Timeline Proxy Resolution → Half</em>.</li>
                <li>2. În <em>Project Settings → Master Settings</em>, setați <strong>Render Cache Format</strong> la <code className="text-amber-300 font-mono">DNxHR SQ</code> (pe Windows) sau <code className="text-amber-300 font-mono">ProRes 422 LT</code> (pe Mac).</li>
                <li>3. Asigurați-vă că locația de Cache este pe un SSD NVMe rapid extern sau intern.</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const filteredSections = sections.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.summary.toLowerCase().includes(q) ||
      s.badge.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-2">
      {/* Header Banner with Search and Expand/Collapse Controls */}
      <div className="bg-gradient-to-r from-[#111827] via-[#1a2335] to-[#121622] p-6 rounded-xl border border-[#2a364a] shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span className="font-mono text-xs text-amber-400 font-bold uppercase tracking-wider">
                DaVinci Resolve Studio Knowledge Base
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Ghid Profesional & Sfaturi Țintite pentru DaVinci Resolve
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Colecție cuprinzătoare de bune practici adunate de pe blogurile și comunitățile internaționale de coloristică (Color grading, Vectorscop, Histogramă, Fusion VFX, Fairlight Audio și Export).
            </p>
          </div>

          {/* Global Accordion Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExpandAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2738] hover:bg-[#28354b] text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-[#34425a] transition-colors"
              title="Desfășoară toate rubricile pentru citire completă"
            >
              <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Desfășoară Tot</span>
            </button>

            <button
              onClick={handleCollapseAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2738] hover:bg-[#28354b] text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-[#34425a] transition-colors"
              title="Restrânge toate rubricile pentru a nu ocupa mult spațiu pe ecran"
            >
              <Minimize2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Restrânge Tot</span>
            </button>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Caută sfaturi (ex: vectorscop, fusion, ten, lufs, histograma, cst, quicktime, zgomot)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0d121c] border border-[#232f44] focus:border-amber-500 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Accordion Sections List */}
      <div className="space-y-3">
        {filteredSections.map((section) => {
          const isOpen = openSections[section.id];

          return (
            <div
              key={section.id}
              className={`rounded-xl border transition-all ${
                isOpen
                  ? 'bg-[#151a26] border-[#34425a] shadow-lg'
                  : 'bg-[#121622] hover:bg-[#161c29] border-[#222b3b]'
              }`}
            >
              {/* Accordion Header (Click to Toggle) */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full text-left p-4.5 flex items-center justify-between gap-4 transition-colors select-none"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#1c2434] border border-[#2b3952] flex items-center justify-center shrink-0">
                    {section.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-amber-400 text-xs font-bold">
                        Rubrica {section.rubricNumber}:
                      </span>
                      <h3 className="text-sm font-bold text-white tracking-tight">
                        {section.title}
                      </h3>
                      <span className="hidden sm:inline-block bg-[#20293a] text-slate-300 font-mono text-[10px] px-2 py-0.5 rounded border border-[#2c384e]">
                        {section.badge}
                      </span>
                    </div>
                    {!isOpen && (
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                        {section.summary}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                    {isOpen ? 'Restrânge' : 'Desfășoară'}
                  </span>
                  <div className={`p-1 rounded-md bg-[#1d2535] text-slate-300 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-400' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </button>

              {/* Accordion Content Body */}
              {isOpen && (
                <div className="px-5 pb-5 pt-2 border-t border-[#232c3f] animate-in fade-in duration-200">
                  {section.content}
                </div>
              )}
            </div>
          );
        })}

        {filteredSections.length === 0 && (
          <div className="text-center py-12 bg-[#121622] rounded-xl border border-[#222b3b] space-y-2">
            <p className="text-sm text-slate-300 font-semibold">
              Nu a fost găsit niciun rezultat pentru „{searchQuery}”.
            </p>
            <p className="text-xs text-slate-500">
              Încercați termeni precum <em>vectorscop</em>, <em>fusion</em>, <em>sunet</em>, <em>ten</em> sau <em>lufs</em>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
